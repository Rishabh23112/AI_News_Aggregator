from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from models.models import Favorite, NewsItem, BroadcastLog
from models.schemas import BroadcastRequest, BroadcastResponse
from services.broadcast import generate_post

router = APIRouter()

@router.post("/", response_model=BroadcastResponse)
def broadcast(payload: BroadcastRequest, db: Session = Depends(get_db)):
    fav = db.query(Favorite).filter_by(id=payload.favorite_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    news = db.query(NewsItem).filter_by(id=fav.news_item_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News item not found")

    content = generate_post(news.title, news.summary, payload.platform)

    # Log to database
    log = BroadcastLog(
        favorite_id=fav.id,
        platform=payload.platform,
        status="simulated_success"
    )
    db.add(log)
    db.commit()

    return {
        "platform": payload.platform,
        "content": content,
        "status": "success",
        "message": "Broadcast simulated and logged."
    }