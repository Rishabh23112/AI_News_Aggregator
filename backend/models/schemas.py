from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List



class NewsResponse(BaseModel):
    id: int
    title: str
    summary: str
    author: Optional[str]
    url: str
    published_at: datetime
    tags: Optional[List[str]]
    impact_score: Optional[float]

    class Config:
        from_attributes = True


class FavoriteCreate(BaseModel):
    user_id: int
    news_item_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    news_item_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BroadcastRequest(BaseModel):
    favorite_id: int
    platform: str  # email, linkedin, whatsapp

class BroadcastResponse(BaseModel):
    platform: str
    content: str
    status: str