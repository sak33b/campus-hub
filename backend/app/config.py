import os

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None


if load_dotenv:
    load_dotenv()


def get_env(name, default=None):
    value = os.getenv(name)
    if value is None:
        return default
    return value


DB_HOST = get_env("DB_HOST", "127.0.0.1")
DB_PORT = int(get_env("DB_PORT", "3306"))
DB_USER = get_env("DB_USER", "root")
DB_PASSWORD = get_env("DB_PASSWORD", "password")
DB_NAME = get_env("DB_NAME", "campus_hub")

JWT_SECRET = get_env("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = get_env("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(get_env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

FRONTEND_ORIGIN = get_env("FRONTEND_ORIGIN", "http://localhost:3000")
