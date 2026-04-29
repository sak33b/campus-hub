import aiomysql
from fastapi import APIRouter, Depends

from app.database import get_db

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/users")
async def search_users(query: str = "", department: str = "", conn=Depends(get_db)):
    query_like = f"%{query}%"
    dept_like = f"%{department}%"

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.UserID, u.Username, u.FirstName, u.LastName, d.DeptName "
            "FROM `User` u LEFT JOIN Department d ON u.DeptID = d.DeptID "
            "WHERE (%s = '' OR CONCAT(u.FirstName, ' ', u.LastName) LIKE %s "
            "OR u.Username LIKE %s) "
            "AND (%s = '' OR d.DeptName LIKE %s)",
            (query, query_like, query_like, department, dept_like),
        )
        rows = await cur.fetchall()

    return rows
