from models.models import NewsItem

Threshold=0.90

def is_duplicate(db, embedding):
    distance_threshold = 1.0 - Threshold
    duplicate = db.query(NewsItem).filter(
        NewsItem.embedding.cosine_distance(embedding) < distance_threshold
    ).first()
    
    return duplicate is not None