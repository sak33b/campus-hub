import aiomysql

from app.config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER

_pool = None


async def init_pool():
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            db=DB_NAME,
            autocommit=False,
            minsize=1,
            maxsize=10,
            charset="utf8mb4",
        )
    return _pool


async def close_pool():
    global _pool
    if _pool is not None:
        _pool.close()
        await _pool.wait_closed()
        _pool = None


async def get_db():
    if _pool is None:
        await init_pool()
    async with _pool.acquire() as conn:
        yield conn
