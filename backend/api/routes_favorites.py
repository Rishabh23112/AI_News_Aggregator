from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from models.models import Favorite, NewsItem, User
from models.schemas import FavoriteAddResponse, FavoriteCreate, FavoriteResponse, NewsResponse

router = APIRouter()

@router.post("/", response_model=FavoriteAddResponse)
def add_favorite(payload: FavoriteCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    news = db.query(NewsItem).filter(NewsItem.id == payload.news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News item not found")

    existing = (
        db.query(Favorite)
        .filter(Favorite.user_id == payload.user_id, Favorite.news_item_id == payload.news_id)
        .first()
    )
    if existing:
        return {"msg": "added", "favorite_id": existing.id}

    fav = Favorite(user_id=payload.user_id, news_item_id=payload.news_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {"msg": "added", "favorite_id": fav.id}

@router.get("/", response_model=list[FavoriteResponse])
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).all()
    result = []
    for fav in favorites:
        news = db.query(NewsItem).filter(NewsItem.id == fav.news_item_id).first()
        if news:
            result.append({
                "favorite_id": fav.id,
                "user_id": fav.user_id,
                "created_at": fav.created_at,
                "news_item": NewsResponse.model_validate(news)
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