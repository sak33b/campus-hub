from datetime import datetime, timedelta

import aiomysql
import bcrypt
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM, JWT_SECRET
from app.database import get_db
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_password_hash(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password, hashed_password):
    # Prefer direct bcrypt verification to avoid passlib+bcrypt runtime issues.
    try:
        if isinstance(hashed_password, str) and hashed_password.startswith("$2"):
            return bcrypt.checkpw(
                plain_password.encode("utf-8"), hashed_password.encode("utf-8")
            )
    except ValueError:
        return False

    # Fallback for legacy hashes if present.
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(data, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(conn=Depends(get_db), token=Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise credentials_exception from exc

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    try:
        user_id = int(user_id)
    except ValueError as exc:
        raise credentials_exception from exc

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT UserID, Username, Email, FirstName, LastName, Bio, DeptID, JoinDate "
            "FROM `User` WHERE UserID = %s",
            (user_id,),
        )
        user = await cur.fetchone()

    if not user:
        raise credentials_exception

    return user
