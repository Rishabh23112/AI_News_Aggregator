import time
from core.db import SessionLocal
from models.models import Source
from services.ingestion import fetch_rss

def run():
    while True:
        db = SessionLocal()
        sources = db.query(Source).filter_by(active=True).all()

        for source in sources:
            fetch_rss(source, db)

        db.close()
        time.sleep(900)  