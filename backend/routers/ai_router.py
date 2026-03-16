from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# LangChain + Gemini
from langchain_google_genai import ChatGoogleGenerativeAI

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None


def get_db_schema():
    try:
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            res = conn.execute(text("SELECT sql FROM sqlite_master WHERE type='table';"))
            tables = res.fetchall()
        return "\n\n".join([t[0] for t in tables if t[0]])
    except Exception as e:
        print("Schema fetch error:", e)
        return ""


def execute_sql(query: str):
    try:
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            res = conn.execute(text(query))
            rows = res.fetchall()
        return str([dict(row._mapping) for row in rows])
    except Exception as e:
        return f"Error executing query: {e}"


@router.post("/chat")
async def chat_with_database(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY environment variable")

    try:
        # Initialize Gemini 2.5 Flash
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
        )

        schema = get_db_schema()

        # Step 1: Generate SQL from natural language
        sql_prompt = []
        if request.history:
            for msg in request.history:
                sql_prompt.append((msg.get("role", "human"), msg.get("content", "")))

        sql_prompt.extend([
            ("system", (
                f"You are an expert SQLite data analyst. Write a valid SQLite query to answer the user's question "
                f"based on this schema:\n{schema}\n\n"
                "Only output the raw SQL query — no backticks, no markdown, no explanation. "
                "Always use SELECT, never modify data. "
                "Use chat history for follow-up context."
            )),
            ("human", request.message)
        ])

        ai_sql_msg = llm.invoke(sql_prompt)
        sql_query = str(ai_sql_msg.content).strip()

        # Strip any accidental markdown fences
        for fence in ("```sql", "```"):
            if sql_query.startswith(fence):
                sql_query = sql_query[len(fence):]
        if sql_query.endswith("```"):
            sql_query = sql_query[:-3]
        sql_query = sql_query.strip()

        print("Generated SQL:", sql_query)

        # Step 2: Execute the query
        db_result = execute_sql(sql_query)
        print("DB Result:", db_result)

        # Step 3: Turn raw result into a friendly answer
        answer_prompt = []
        if request.history:
            for msg in request.history:
                answer_prompt.append((msg.get("role", "human"), msg.get("content", "")))

        answer_prompt.extend([
            ("system", (
                "You are a friendly supply chain assistant. The user asked a question and an SQL query was run "
                "against the database. Answer concisely in plain English based on the result."
            )),
            ("human", (
                f"User Question: {request.message}\n\n"
                f"SQL Query run: {sql_query}\n\n"
                f"Raw Database Result: {db_result}"
            ))
        ])

        final_msg = llm.invoke(answer_prompt)
        final_text = str(final_msg.content).strip()

        return {"response": final_text}

    except Exception as e:
        print(f"AI Agent Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI encountered an error: {str(e)}")
