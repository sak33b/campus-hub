import aiomysql
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas import VoteRequest
from app.utils.auth import get_current_user

router = APIRouter(prefix="/votes", tags=["votes"])


@router.post("/posts/{post_id}")
async def vote_post(
    post_id: int,
    payload: VoteRequest,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if payload.vote_type not in {"upvote", "downvote"}:
        raise HTTPException(status_code=400, detail="Invalid vote type")

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT 1 FROM Post WHERE PostID = %s", (post_id,))
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Post not found")

        await cur.execute(
            "SELECT VoteType FROM Votes_On_Post WHERE UserID = %s AND PostID = %s",
            (current_user["UserID"], post_id),
        )
        existing = await cur.fetchone()

        if existing:
            await cur.execute(
                "UPDATE Votes_On_Post SET VoteType = %s WHERE UserID = %s AND PostID = %s",
                (payload.vote_type, current_user["UserID"], post_id),
            )
        else:
            await cur.execute(
                "INSERT INTO Votes_On_Post (UserID, PostID, VoteType) VALUES (%s, %s, %s)",
                (current_user["UserID"], post_id, payload.vote_type),
            )

        await conn.commit()

    return {"status": "ok", "vote_type": payload.vote_type}


@router.delete("/posts/{post_id}")
async def remove_vote(
    post_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "DELETE FROM Votes_On_Post WHERE UserID = %s AND PostID = %s",
            (current_user["UserID"], post_id),
        )
        await conn.commit()

    return {"status": "deleted"}
