import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import GEMINI_API_KEY
from services.tools_async import get_latest_news_async, search_news_async

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=GEMINI_API_KEY,
    temperature=0.3
)


async def run_parallel_agent(query: str):

    latest_task = get_latest_news_async()
    search_task = search_news_async(query)

    latest, search = await asyncio.gather(
        latest_task,
        search_task
    )

    combined_context = f"""
    Latest News:
    {latest}

    Relevant News:
    {search}
    """

    response = await llm.ainvoke(f"""
    User Query: {query}

    Use the following context to answer:

    {combined_context}

    Provide a clean, insightful answer.
    """)

    return response.content
