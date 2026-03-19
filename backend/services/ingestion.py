import feedparser
from sqlalchemy.orm import Session
from models.models import NewsItem, Source
from services.embeddings import get_embedding
from services.dedup import is_duplicate
import hashlib
from datetime import datetime
import time

from sqlalchemy.exc import IntegrityError

def hash_content(text: str):
    return hashlib.md5(text.encode()).hexdigest()

def fetch_rss(source: Source, db: Session):
    feed = feedparser.parse(source.url)
    
    # Track hashes and URLs to avoid duplicates within the same batch
    seen_hashes = set()
    seen_urls = set()

    for entry in feed.entries:
        title = entry.get("title", "")
        summary = entry.get("summary", "")
        url = entry.get("link", "")
        
        if not url or not title:
            continue

        author = entry.get("author") or entry.get("dc_creator") or ""
        
        published_parsed = entry.get("published_parsed") or entry.get("updated_parsed")
        if published_parsed:
            published_at = datetime.fromtimestamp(time.mktime(published_parsed))
        else:
            published_at = datetime.utcnow()

        content = title + summary
        content_hash = hash_content(content)

        # Skip if already seen in this batch
        if content_hash in seen_hashes or url in seen_urls:
            continue

        # Check database for existing item
        if db.query(NewsItem).filter((NewsItem.content_hash == content_hash) | (NewsItem.url == url)).first():
            continue

        embedding = get_embedding(content)
        duplicate = is_duplicate(db, embedding)

        # Extract discussion URL (Reddit/HN specific handles)
        discussion_url = None
        if "reddit.com" in url:
            discussion_url = url
        elif "hnrss.org" in source.url or "hacker-news" in source.name.lower():
            discussion_url = entry.get("comments")

        news = NewsItem(
            source_id=source.id,
            title=title,
            summary=summary,
            url=url,
            author=author,
            published_at=published_at,
            content_hash=content_hash,
            embedding=embedding,
            is_duplicate=duplicate,
            discussion_url=discussion_url
        )

        db.add(news)
        seen_hashes.add(content_hash)
        seen_urls.add(url)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
