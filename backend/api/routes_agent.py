from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from agents.news_agent import run_agent_async, run_agent_stream
from agents.parallel_agent import run_parallel_agent

router = APIRouter(tags=["Agent"])


@router.get("/ask")
async def ask_agent(
    query: str = Query(..., description="Ask anything about news")
):
    result = await run_agent_async(query)

    return {
        "status": "success",
        "query": query,
        "response": result["output"]
    }


@router.get("/ask-stream")
async def ask_agent_stream(
    query: str = Query(..., description="Stream response from agent")
):
    async def generate():
        async for chunk in run_agent_stream(query):
            yield chunk

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )


@router.get("/ask-parallel")
async def ask_parallel_agent(
    query: str = Query(..., description="Parallel retrieval + AI synthesis")
):
    result = await run_parallel_agent(query)

    return {
        "status": "success",
        "query": query,
        "response": result
    }