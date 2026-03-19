import asyncio
from sqlalchemy.orm import Session
from core.db import SessionLocal
from models.models import NewsItem
from services.embeddings import get_embedding


async def get_latest_news_async(limit=5):
    def db_call():
        db: Session = SessionLocal()
        news = db.query(NewsItem).order_by(NewsItem.published_at.desc()).limit(limit).all()
        db.close()
        return news

    news = await asyncio.to_thread(db_call)

    return "\n\n---\n\n".join([
        f"### {n.title}\n\n{n.summary}\n\n[Read more]({n.url})"
        for n in news
    ])




async def search_news_async(query: str):
    def db_call():
        db: Session = SessionLocal()
        embedding = get_embedding(query)

        news = (
            db.query(NewsItem)
            .filter(NewsItem.embedding != None)
            .order_by(NewsItem.embedding.cosine_distance(embedding))
            .limit(5)
            .all()
        )
        db.close()
        return news

    news = await asyncio.to_thread(db_call)

    return "\n\n---\n\n".join([
        f"### {n.title}\n\n{n.summary}\n\n[Read more]({n.url})"
        for n in news
    ])