from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from core.config import GEMINI_API_KEY

llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    api_key=GEMINI_API_KEY
)

base_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "You are an expert AI content strategist who writes high-performing posts."),
    
    ("user", 
     """Platform: {platform}

    Write a high-quality post based on:

    Title: {title}
    Summary: {summary}

    Instructions:
    - Start with a strong hook
    - Add insight, not just summary
    - Keep it concise and engaging
    - Add hashtags if relevant

    Style Guidelines:
    {style}
    """)
    ]
    )

parser=StrOutputParser()

chain = base_prompt | llm | parser


def generate_post(title: str, summary: str, platform: str):
    platform = platform.lower()

    styles = {
        "linkedin": "Professional, insightful, with hashtags",
        "twitter": "Short, catchy, under 280 characters",
        "newsletter": "Detailed, structured, informative"
    }

    return chain.invoke({
        "title": title,
        "summary": summary,
        "platform": platform,
        "style": styles.get(platform, "professional")
    })

def send_email_mock(content):
    print("EMAIL SENT:", content)

def send_whatsapp_mock(content):
    print("WHATSAPP SENT:", content)