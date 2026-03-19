from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class UserResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: Optional[str] = None
    role: Optional[str] = "user"



class SourceResponse(BaseModel):
    id: int
    name: str
    url: str
    type: str
    active: bool

    class Config:
        from_attributes = True


class NewsResponse(BaseModel):
    id: int
    source_id: Optional[int] = None
    title: str
    summary: str
    author: Optional[str]
    url: str
    published_at: datetime
    tags: Optional[List[str]]
    impact_score: Optional[float]
    is_duplicate: Optional[bool] = None

    class Config:
        from_attributes = True


class FavoriteCreate(BaseModel):
    user_id: int
    news_id: int


class FavoriteResponse(BaseModel):
    favorite_id: int
    user_id: int
    created_at: datetime
    news_item: NewsResponse

class FavoriteAddResponse(BaseModel):
    msg: str
    favorite_id: int


class BroadcastRequest(BaseModel):
    favorite_id: int
    platform: str  # email, linkedin, whatsapp

class BroadcastResponse(BaseModel):
    platform: str
    content: str
    status: str
    message: Optional[str] = None