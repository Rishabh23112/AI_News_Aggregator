from core.db import SessionLocal
from models.models import Source

def seed_db():
    db = SessionLocal()
    sources_data = [
        ("OpenAI Blog", "https://openai.com/blog/rss.xml"),
        ("Google AI Blog", "https://blog.google/technology/ai/rss/"),
        ("Meta AI", "https://engineering.fb.com/category/ai-research/feed/"),
        ("Anthropic", "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_research.xml"),
        ("DeepMind", "https://deepmind.google/blog/rss.xml"),
        ("Hugging Face", "https://huggingface.co/blog/feed.xml"),
        ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/"),
        ("VentureBeat AI", "https://venturebeat.com/category/ai/feed/"),
        ("The Verge Tech", "https://www.theverge.com/rss/technology/index.xml"),
        ("Wired AI", "https://www.wired.com/feed/tag/ai/latest/rss"),
        ("MIT Tech Review AI", "https://www.technologyreview.com/topic/artificial-intelligence/feed"),
        ("Y Combinator Blog", "https://blog.ycombinator.com/rss/"),
        ("arXiv cs.AI", "http://export.arxiv.org/rss/cs.AI"),
        ("PapersWithCode", "https://export.arxiv.org/rss/cs.LG"),
        ("Product Hunt AI", "https://www.producthunt.com/feed?category=artificial-intelligence"),
        ("Hacker News AI", "https://hnrss.org/newest?q=AI"),
        ("YouTube AI Channels", "https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg"),
        ("Reddit r/MachineLearning", "https://www.reddit.com/r/MachineLearning/.rss"),
        ("Microsoft AI Blog", "https://blogs.microsoft.com/ai/feed/"),
        ("Stability AI Blog", "https://stability.ai/news?format=rss")
    ]

    for name, url in sources_data:
        if not db.query(Source).filter_by(name=name).first():
            db.add(Source(name=name, url=url, type="rss", active=True))
    
    db.commit()
    print(f"Successfully guaranteed {len(sources_data)} sources are in the database!")

if __name__ == "__main__":
    seed_db()
