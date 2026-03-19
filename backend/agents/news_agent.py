from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate

from sqlalchemy.orm import Session
from core.db import SessionLocal
from models.models import NewsItem
from services.embeddings import get_embedding
from core.config import GEMINI_API_KEY


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=GEMINI_API_KEY,
    temperature=0
)




@tool
def get_latest_news(limit: int = 5) -> str:
    """Fetch the latest AI news articles. Use this when the user asks for new or recent news."""
    db: Session = SessionLocal()
    news = db.query(NewsItem).order_by(NewsItem.published_at.desc()).limit(limit).all()
    db.close()

    return "\n\n---\n\n".join([
        f"### {n.title}\n\n{n.summary}\n\n[Read more]({n.url})"
        for n in news
    ])




@tool
def search_news(query: str) -> str:
    """Search for relevant news articles based on a specific query or topic."""
    db: Session = SessionLocal()

    embedding = get_embedding(query)

    news = (
        db.query(NewsItem)
        .filter(NewsItem.embedding != None)
        .order_by(NewsItem.embedding.cosine_distance(embedding))
        .limit(5)
        .all()
    )
    db.close()

    return "\n\n---\n\n".join([
        f"### {n.title}\n\n{n.summary}\n\n[Read more]({n.url})"
        for n in news
    ])



prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a professional AI news assistant. Provide clean, insightful, and well-organized answers. Use Markdown headers (###) for news titles and bullet points for summaries. Always include clickable links."),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])



tools = [get_latest_news, search_news]

agent = create_tool_calling_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)


async def run_agent_async(query: str):
    return await agent_executor.ainvoke({"input": query})


async def run_agent_stream(query: str):
    async for chunk in agent_executor.astream({"input": query}):
        if "output" in chunk:
            yield chunk["output"]
