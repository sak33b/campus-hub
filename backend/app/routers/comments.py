import aiomysql
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas import CommentCreate, CommentOut
from app.utils.auth import get_current_user

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/posts/{post_id}", response_model=list[CommentOut])
async def list_comments(post_id: int, conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT c.CommentID, c.ParentID, c.PostID, c.Content, c.Timestamp, "
            "c.UserID, u.Username "
            "FROM Comment c JOIN `User` u ON u.UserID = c.UserID "
            "WHERE c.PostID = %s ORDER BY c.Timestamp ASC",
            (post_id,),
        )
        rows = await cur.fetchall()

    return [
        {
            "comment_id": row["CommentID"],
            "parent_id": row["ParentID"],
            "post_id": row["PostID"],
            "content": row["Content"],
            "timestamp": row["Timestamp"],
            "user_id": row["UserID"],
            "username": row["Username"],
        }
        for row in rows
    ]


@router.post("/posts/{post_id}", response_model=CommentOut)
async def create_comment(
    post_id: int,
    payload: CommentCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT 1 FROM Post WHERE PostID = %s", (post_id,))
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Post not found")

        await cur.execute(
            "INSERT INTO Comment (ParentID, PostID, Content, UserID) VALUES (NULL, %s, %s, %s)",
            (post_id, payload.content, current_user["UserID"]),
        )
        await conn.commit()
        comment_id = cur.lastrowid

        await cur.execute(
            "SELECT c.CommentID, c.ParentID, c.PostID, c.Content, c.Timestamp, c.UserID, u.Username "
            "FROM Comment c JOIN `User` u ON u.UserID = c.UserID WHERE c.CommentID = %s",
            (comment_id,),
        )
        row = await cur.fetchone()

    return {
        "comment_id": row["CommentID"],
        "parent_id": row["ParentID"],
        "post_id": row["PostID"],
        "content": row["Content"],
        "timestamp": row["Timestamp"],
        "user_id": row["UserID"],
        "username": row["Username"],
    }


@router.post("/{comment_id}/replies", response_model=CommentOut)
async def create_reply(
    comment_id: int,
    payload: CommentCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT PostID FROM Comment WHERE CommentID = %s", (comment_id,)
        )
        parent = await cur.fetchone()
        if not parent:
            raise HTTPException(status_code=404, detail="Comment not found")

        await cur.execute(
            "INSERT INTO Comment (ParentID, PostID, Content, UserID) VALUES (%s, %s, %s, %s)",
            (comment_id, parent["PostID"], payload.content, current_user["UserID"]),
        )
        await conn.commit()
        reply_id = cur.lastrowid

        await cur.execute(
            "SELECT c.CommentID, c.ParentID, c.PostID, c.Content, c.Timestamp, c.UserID, u.Username "
            "FROM Comment c JOIN `User` u ON u.UserID = c.UserID WHERE c.CommentID = %s",
            (reply_id,),
        )
        row = await cur.fetchone()

    return {
        "comment_id": row["CommentID"],
        "parent_id": row["ParentID"],
        "post_id": row["PostID"],
        "content": row["Content"],
        "timestamp": row["Timestamp"],
        "user_id": row["UserID"],
        "username": row["Username"],
    }


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT UserID FROM Comment WHERE CommentID = %s", (comment_id,)
        )
        comment = await cur.fetchone()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if comment["UserID"] != current_user["UserID"]:
            raise HTTPException(status_code=403, detail="Not allowed")

        await cur.execute("DELETE FROM Comment WHERE CommentID = %s", (comment_id,))
        await conn.commit()

    return {"status": "deleted"}
