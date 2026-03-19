from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.db import get_db
from models.models import User
from models.schemas import UserCreate, UserResponse


router = APIRouter()


@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()


@router.post("/", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    if payload.email:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already exists")

    user = User(name=payload.name, email=payload.email, role=payload.role or "user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

