import aiomysql
from fastapi import APIRouter, Depends

from app.database import get_db

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("")
async def list_departments(conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT DeptID, DeptCode, DeptName FROM Department")
        rows = await cur.fetchall()
    return rows
