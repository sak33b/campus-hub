import aiomysql
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter(prefix="/follows", tags=["follows"])


@router.post("/users/{user_id}")
async def follow_user(
    user_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if user_id == current_user["UserID"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT 1 FROM `User` WHERE UserID = %s", (user_id,))
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        await cur.execute(
            "INSERT IGNORE INTO Follows (FollowerID, FolloweeID) VALUES (%s, %s)",
            (current_user["UserID"], user_id),
        )
        await conn.commit()

    return {"status": "followed"}


@router.delete("/users/{user_id}")
async def unfollow_user(
    user_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "DELETE FROM Follows WHERE FollowerID = %s AND FolloweeID = %s",
            (current_user["UserID"], user_id),
        )
        await conn.commit()

    return {"status": "unfollowed"}


@router.get("/users/{user_id}/status")
async def follow_status(
    user_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT 1 FROM Follows WHERE FollowerID = %s AND FolloweeID = %s",
            (current_user["UserID"], user_id),
        )
        row = await cur.fetchone()

    return {"is_following": bool(row)}
