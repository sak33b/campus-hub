from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
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


app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(users.router)
app.include_router(search.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(votes.router)
app.include_router(follows.router)
app.include_router(messages.router)
app.include_router(trending.router)
