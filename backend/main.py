from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from api import routes_news, routes_favorites, routes_broadcast, routes_agent
from core.db import engine, Base
import models.models  
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    try:
        conn.execute(text("TRUNCATE TABLE news_items CASCADE"))
        conn.execute(text("ALTER TABLE news_items ALTER COLUMN embedding TYPE vector(384)"))
    except Exception:
        pass
    conn.commit()

Base.metadata.create_all(bind=engine)

from contextlib import asynccontextmanager
import threading
from worker.scheduler import run as run_scheduler
from core.db import SessionLocal
from models.models import Source

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    if db.query(Source).count() == 0:
        db.add_all([
            Source(name="OpenAI Blog", url="https://openai.com/blog/rss.xml", type="rss", active=True),
            Source(name="Google AI Blog", url="https://blog.google/technology/ai/rss/", type="rss", active=True),
            Source(name="Meta AI", url="https://engineering.fb.com/category/ai-research/feed/", type="rss", active=True),
            Source(name="Anthropic", url="https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_research.xml", type="rss", active=True),
            Source(name="DeepMind", url="https://deepmind.google/blog/rss.xml", type="rss", active=True),
            Source(name="Hugging Face", url="https://huggingface.co/blog/feed.xml", type="rss", active=True),
            Source(name="TechCrunch AI", url="https://techcrunch.com/category/artificial-intelligence/feed/", type="rss", active=True),
            Source(name="VentureBeat AI", url="https://venturebeat.com/category/ai/feed/", type="rss", active=True),
            Source(name="The Verge Tech", url="https://www.theverge.com/rss/technology/index.xml", type="rss", active=True),
            Source(name="Wired AI", url="https://www.wired.com/feed/tag/ai/latest/rss", type="rss", active=True),
            Source(name="MIT Tech Review AI", url="https://www.technologyreview.com/topic/artificial-intelligence/feed", type="rss", active=True),
            Source(name="Y Combinator Blog", url="https://blog.ycombinator.com/rss/", type="rss", active=True),
            Source(name="arXiv cs.AI", url="http://export.arxiv.org/rss/cs.AI", type="rss", active=True),
            Source(name="PapersWithCode", url="https://export.arxiv.org/rss/cs.LG", type="rss", active=True),
            Source(name="Product Hunt AI", url="https://www.producthunt.com/feed?category=artificial-intelligence", type="rss", active=True),
            Source(name="Hacker News AI", url="https://hnrss.org/newest?q=AI", type="rss", active=True),
            Source(name="YouTube AI Channels", url="https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg", type="rss", active=True),
            Source(name="Reddit r/MachineLearning", url="https://www.reddit.com/r/MachineLearning/.rss", type="rss", active=True),
            Source(name="Microsoft AI Blog", url="https://blogs.microsoft.com/ai/feed/", type="rss", active=True),
            Source(name="Stability AI Blog", url="https://stability.ai/news?format=rss", type="rss", active=True)
        ])
        db.commit()
    db.close()
    
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_news.router, prefix="/news", tags=["news"])
app.include_router(routes_favorites.router, prefix="/favorites", tags=["favorites"])
app.include_router(routes_broadcast.router, prefix="/broadcast", tags=["broadcast"])
app.include_router(routes_agent.router, prefix="/agent", tags=["agent"])

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")
