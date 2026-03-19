import feedparser
from sqlalchemy.orm import Session
from models.models import NewsItem, Source
from services.embeddings import get_embedding
from services.dedup import is_duplicate
import hashlib
from datetime import datetime
import time

def hash_content(text: str):
    return hashlib.md5(text.encode()).hexdigest()

def fetch_rss(source: Source, db: Session):
    feed = feedparser.parse(source.url)

    for entry in feed.entries:
        title = entry.get("title", "")
        summary = entry.get("summary", "")
        url = entry.get("link", "")
        
        author = entry.get("author") or entry.get("dc_creator") or ""
        
        published_parsed = entry.get("published_parsed") or entry.get("updated_parsed")
        if published_parsed:
            published_at = datetime.fromtimestamp(time.mktime(published_parsed))
        else:
            published_at = datetime.utcnow()

        content = title + summary
        content_hash = hash_content(content)

        if db.query(NewsItem).filter_by(content_hash=content_hash).first():
            continue

        embedding = get_embedding(content)

        duplicate = is_duplicate(db, embedding)

        news = NewsItem(
            source_id=source.id,
            title=title,
            summary=summary,
            url=url,
            author=author,
            published_at=published_at,
            content_hash=content_hash,
            embedding=embedding,
            is_duplicate=duplicate
        )

        db.add(news)

    db.commit()