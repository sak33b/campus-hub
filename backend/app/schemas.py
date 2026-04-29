from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dept_id: Optional[int] = None
    username: Optional[str] = None
    bio: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    bio: Optional[str]
    dept_id: Optional[int]
    dept_name: Optional[str]
    join_date: datetime


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    dept_id: Optional[int] = None


class PostCreate(BaseModel):
    content: str
    visibility_level: str = "public"


class PostOut(BaseModel):
    post_id: int
    content: str
    timestamp: datetime
    visibility_level: str
    user_id: int
    username: str
    vote_score: int
    comment_count: int
    user_vote: Optional[str]


class CommentCreate(BaseModel):
    content: str


class CommentOut(BaseModel):
    comment_id: int
    parent_id: Optional[int]
    post_id: int
    content: str
    timestamp: datetime
    user_id: int
    username: str


class VoteRequest(BaseModel):
    vote_type: str


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    message_id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
