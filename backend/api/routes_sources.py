from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db import get_db
from models.models import Source
from models.schemas import SourceResponse

router = APIRouter()


@router.get("/", response_model=list[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    return db.query(Source).order_by(Source.name.asc()).all()
