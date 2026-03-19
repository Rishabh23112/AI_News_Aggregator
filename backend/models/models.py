from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from core.db import Base
from datetime import datetime
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import ARRAY

class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    url = Column(String)
    type = Column(String)
    active = Column(Boolean, default=True)

class NewsItem(Base):
    __tablename__ = "news_items"

    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey("sources.id"))
    title = Column(String)
    summary = Column(Text)
    author = Column(String)
    url = Column(String, unique=True)
    published_at = Column(DateTime, default=datetime.utcnow)

    extracted_text = Column(Text)
    tags = Column(ARRAY(String))

    content_hash = Column(String, unique=True)

    is_duplicate = Column(Boolean, default=False)
    cluster_id = Column(Integer)

    embedding = Column(Vector(384))
    impact_score = Column(Float, default=0.0)

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    news_item_id = Column(Integer, ForeignKey("news_items.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class BroadcastLog(Base):
    __tablename__ = "broadcast_logs"

    id = Column(Integer, primary_key=True)
    favorite_id = Column(Integer, ForeignKey("favorites.id"))
    platform = Column(String)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)