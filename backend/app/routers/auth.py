import re

import aiomysql
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import get_db
from app.schemas import LoginRequest, RegisterRequest, Token
from app.utils.auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _split_full_name(full_name):
    parts = [p for p in re.split(r"\s+", full_name.strip()) if p]
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def _normalize_username(candidate):
    cleaned = re.sub(r"[^a-zA-Z0-9_]+", "", candidate).lower()
    return cleaned or "user"


async def _ensure_unique_username(conn, base_username):
    username = base_username
    counter = 1
    async with conn.cursor(aiomysql.DictCursor) as cur:
        while True:
            await cur.execute(
                "SELECT 1 FROM `User` WHERE Username = %s LIMIT 1", (username,)
            )
            exists = await cur.fetchone()
            if not exists:
                return username
            counter += 1
            username = f"{base_username}{counter}"


@router.post("/register", response_model=Token)
async def register(payload: RegisterRequest, conn=Depends(get_db)):
    first_name = payload.first_name
    last_name = payload.last_name
    if payload.full_name and (not first_name or not last_name):
        split_first, split_last = _split_full_name(payload.full_name)
        first_name = first_name or split_first
        last_name = last_name or split_last

    if not first_name:
        raise HTTPException(status_code=400, detail="First name is required")

    username = payload.username or payload.email.split("@")[0]
    username = _normalize_username(username)

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT 1 FROM `User` WHERE Email = %s", (payload.email,))
        if await cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        username = await _ensure_unique_username(conn, username)
        pwd_hash = get_password_hash(payload.password)
        await cur.execute(
            "INSERT INTO `User` (Username, Email, FirstName, LastName, Bio, PwdHash, DeptID) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (
                username,
                payload.email,
                first_name,
                last_name or "",
                payload.bio,
                pwd_hash,
                payload.dept_id,
            ),
        )
        await conn.commit()
        user_id = cur.lastrowid

    token = create_access_token({"sub": str(user_id)})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, conn=Depends(get_db)):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT UserID, PwdHash FROM `User` WHERE Email = %s", (payload.email,)
        )
        user = await cur.fetchone()

    if not user or not verify_password(payload.password, user["PwdHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    token = create_access_token({"sub": str(user["UserID"])})
    return Token(access_token=token)


@router.post("/logout")
async def logout(current_user=Depends(get_current_user)):
    # JWT is stateless in this app, so logout is client-side token removal.
    # This endpoint exists to complete the session lifecycle contract.
    return {"status": "logged_out", "user_id": current_user["UserID"]}
