import aiomysql
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.schemas import UserOut, UserUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(conn=Depends(get_db), current_user=Depends(get_current_user)):
    return await get_user(current_user["UserID"], conn)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.UserID, u.Username, u.Email, u.FirstName, u.LastName, u.Bio, "
            "u.DeptID, d.DeptName AS DeptName, u.JoinDate "
            "FROM `User` u LEFT JOIN Department d ON u.DeptID = d.DeptID "
            "WHERE u.UserID = %s",
            (user_id,),
        )
        user = await cur.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user["UserID"],
        "username": user["Username"],
        "email": user["Email"],
        "first_name": user["FirstName"],
        "last_name": user["LastName"],
        "bio": user["Bio"],
        "dept_id": user["DeptID"],
        "dept_name": user["DeptName"],
        "join_date": user["JoinDate"],
    }


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    updates = []
    values = []

    if payload.first_name is not None:
        updates.append("FirstName = %s")
        values.append(payload.first_name)
    if payload.last_name is not None:
        updates.append("LastName = %s")
        values.append(payload.last_name)
    if payload.bio is not None:
        updates.append("Bio = %s")
        values.append(payload.bio)
    if payload.dept_id is not None:
        updates.append("DeptID = %s")
        values.append(payload.dept_id)

    if updates:
        values.append(current_user["UserID"])
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                f"UPDATE `User` SET {', '.join(updates)} WHERE UserID = %s", values
            )
            await conn.commit()

    return await get_user(current_user["UserID"], conn)


@router.get("/{user_id}/followers")
async def get_followers(user_id: int, conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.UserID, u.Username, u.FirstName, u.LastName "
            "FROM Follows f JOIN `User` u ON f.FollowerID = u.UserID "
            "WHERE f.FolloweeID = %s",
            (user_id,),
        )
        rows = await cur.fetchall()
    return rows


@router.get("/{user_id}/following")
async def get_following(user_id: int, conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.UserID, u.Username, u.FirstName, u.LastName "
            "FROM Follows f JOIN `User` u ON f.FolloweeID = u.UserID "
            "WHERE f.FollowerID = %s",
            (user_id,),
        )
        rows = await cur.fetchall()
    return rows
