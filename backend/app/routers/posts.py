import aiomysql
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import JWT_ALGORITHM, JWT_SECRET
from app.database import get_db
from app.schemas import PostCreate, PostOut
from app.utils.auth import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])
optional_oauth = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def _sort_clause(sort):
    if sort == "top":
        return "vote_score DESC, p.Timestamp DESC"
    if sort == "hot":
        return "(vote_score + comment_count) DESC, p.Timestamp DESC"
    return "p.Timestamp DESC"


async def _optional_user(token, conn):
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        user_id = int(user_id)
    except ValueError:
        return None
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT UserID FROM `User` WHERE UserID = %s", (user_id,))
        user = await cur.fetchone()
    return user


@router.get("", response_model=list[PostOut])
async def list_posts(
    sort: str = "new",
    user_id: int | None = None,
    conn=Depends(get_db),
    token=Depends(optional_oauth),
):
    current_user = await _optional_user(token, conn)
    current_user_id = current_user["UserID"] if current_user else None

    where_clause = ""
    params = []
    if user_id is not None:
        where_clause = "WHERE p.UserID = %s "
        params.append(user_id)

    query = (
        "SELECT p.PostID, p.Content, p.Timestamp, p.VisibilityLevel, "
        "p.UserID, u.Username, "
        "COALESCE(votes.vote_score, 0) AS vote_score, "
        "COALESCE(comments.comment_count, 0) AS comment_count, "
        "uv.VoteType AS user_vote "
        "FROM Post p "
        "JOIN `User` u ON u.UserID = p.UserID "
        "LEFT JOIN ("
        "  SELECT PostID, SUM(CASE WHEN VoteType = 'upvote' THEN 1 ELSE -1 END) AS vote_score "
        "  FROM Votes_On_Post GROUP BY PostID"
        ") votes ON votes.PostID = p.PostID "
        "LEFT JOIN ("
        "  SELECT PostID, COUNT(*) AS comment_count FROM Comment WHERE ParentID IS NULL GROUP BY PostID"
        ") comments ON comments.PostID = p.PostID "
        "LEFT JOIN Votes_On_Post uv ON uv.PostID = p.PostID AND uv.UserID = %s "
        + where_clause
        + f"ORDER BY {_sort_clause(sort)}"
    )

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(query, [current_user_id, *params])
        rows = await cur.fetchall()

    return [
        {
            "post_id": row["PostID"],
            "content": row["Content"],
            "timestamp": row["Timestamp"],
            "visibility_level": row["VisibilityLevel"],
            "user_id": row["UserID"],
            "username": row["Username"],
            "vote_score": row["vote_score"],
            "comment_count": row["comment_count"],
            "user_vote": row["user_vote"],
        }
        for row in rows
    ]


@router.post("", response_model=PostOut)
async def create_post(
    payload: PostCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "INSERT INTO Post (Content, VisibilityLevel, UserID) VALUES (%s, %s, %s)",
            (payload.content, payload.visibility_level, current_user["UserID"]),
        )
        await conn.commit()
        post_id = cur.lastrowid

        await cur.execute(
            "SELECT p.PostID, p.Content, p.Timestamp, p.VisibilityLevel, p.UserID, u.Username "
            "FROM Post p JOIN `User` u ON u.UserID = p.UserID WHERE p.PostID = %s",
            (post_id,),
        )
        row = await cur.fetchone()

    return {
        "post_id": row["PostID"],
        "content": row["Content"],
        "timestamp": row["Timestamp"],
        "visibility_level": row["VisibilityLevel"],
        "user_id": row["UserID"],
        "username": row["Username"],
        "vote_score": 0,
        "comment_count": 0,
        "user_vote": None,
    }


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT UserID FROM Post WHERE PostID = %s", (post_id,))
        post = await cur.fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post["UserID"] != current_user["UserID"]:
            raise HTTPException(status_code=403, detail="Not allowed")

        await cur.execute("DELETE FROM Post WHERE PostID = %s", (post_id,))
        await conn.commit()

    return {"status": "deleted"}
