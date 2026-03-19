from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from core.db import get_db
from models.models import NewsItem, Source
from services.ingestion import fetch_rss

router = APIRouter()

@router.get("/")
def get_news(
    keyword: Optional[str] = Query(None, description="Search by keyword in title or summary"),
    source_id: Optional[int] = Query(None, description="Filter by source ID"),
    db: Session = Depends(get_db)
):
    query = db.query(NewsItem)
    if keyword:
        query = query.filter(or_(NewsItem.title.ilike(f"%{keyword}%"), NewsItem.summary.ilike(f"%{keyword}%")))
    if source_id:
        query = query.filter(NewsItem.source_id == source_id)
        
    return query.order_by(NewsItem.published_at.desc()).limit(50).all()

@router.get("/{news_id}")
def get_news_by_id(news_id: int, db: Session = Depends(get_db)):
    news = db.query(NewsItem).filter_by(id=news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News item not found")
    return news

@router.post("/refresh")
def refresh_news(db: Session = Depends(get_db)):
    sources = db.query(Source).filter_by(active=True).all()
    count = 0
    for source in sources:
        try:
            fetch_rss(source, db)
            count += 1
        except Exception as e:
            print(f"Error fetching from {source.name}: {e}")
            
    return {"status": "success", "message": f"Triggered refresh for {count} sources"}