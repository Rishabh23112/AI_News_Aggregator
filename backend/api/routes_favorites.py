from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from models.models import Favorite, NewsItem

router = APIRouter()

@router.post("/")
def add_favorite(user_id: int, news_id: int, db: Session = Depends(get_db)):
    fav = Favorite(user_id=user_id, news_item_id=news_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {"msg": "added", "favorite_id": fav.id}

@router.get("/")
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    result = []
    for fav in favorites:
        news = db.query(NewsItem).filter(NewsItem.id == fav.news_item_id).first()
        if news:
            result.append({
                "favorite_id": fav.id,
                "news_item": news
            })
    return result

@router.delete("/{favorite_id}")
def remove_favorite(favorite_id: int, db: Session = Depends(get_db)):
    fav = db.query(Favorite).filter(Favorite.id == favorite_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(fav)
    db.commit()
    return {"msg": "removed"}