from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import FRONTEND_ORIGIN
from app.database import close_pool, init_pool
from app.routers import (
    auth,
    comments,
    departments,
    follows,
    messages,
    posts,
    search,
    trending,
    users,
    votes,
)

app = FastAPI(title="Campus Hub API")
API_PREFIX = "/api"
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

allowed_origins = {
    FRONTEND_ORIGIN,
    "http://127.0.0.1:8000",
    "http://localhost:8000",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_pool()


@app.on_event("shutdown")
async def shutdown():
    await close_pool()


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def _serve_page(filename: str):
    path = STATIC_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Page not found")
    return FileResponse(path)


@app.get("/", include_in_schema=False)
async def home_page():
    return _serve_page("index.html")


@app.get("/login", include_in_schema=False)
async def login_page():
    return _serve_page("login.html")


@app.get("/register", include_in_schema=False)
async def register_page():
    return _serve_page("register.html")


@app.get("/notifications", include_in_schema=False)
async def notifications_page():
    return _serve_page("notifications.html")


@app.get("/search", include_in_schema=False)
async def search_page():
    return _serve_page("search.html")


@app.get("/messages", include_in_schema=False)
async def messages_page():
    return _serve_page("messages.html")


@app.get("/messages/{user_id}", include_in_schema=False)
async def messages_thread_page(user_id: int):
    return _serve_page("messages-thread.html")


@app.get("/following", include_in_schema=False)
async def following_page():
    return _serve_page("following.html")


@app.get("/profile/{user_id}", include_in_schema=False)
async def profile_page(user_id: int):
    return _serve_page("profile.html")


@app.get("/post/{post_id}", include_in_schema=False)
async def post_detail_page(post_id: int):
    return _serve_page("post-detail.html")


app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(departments.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(search.router, prefix=API_PREFIX)
app.include_router(posts.router, prefix=API_PREFIX)
app.include_router(comments.router, prefix=API_PREFIX)
app.include_router(votes.router, prefix=API_PREFIX)
app.include_router(follows.router, prefix=API_PREFIX)
app.include_router(messages.router, prefix=API_PREFIX)
app.include_router(trending.router, prefix=API_PREFIX)
