import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from rag.indexer import get_chat_model, get_retriever, index_document


from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="DocWise RAG Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


@app.on_event("startup")
def startup_warning() -> None:
    if not GEMINI_API_KEY:
        print(
            "WARNING: GEMINI_API_KEY is not set. /index will fail until the key is configured in rag-service/.env.",
            flush=True,
        )


class SummarizeRequest(BaseModel):
    document_id: str
    text: str


class QnaRequest(BaseModel):
    document_id: str
    text: str
    question: str


class IndexRequest(BaseModel):
    document_id: str
    text: str


def extract_text(content: object) -> str:
    """Gemini responses sometimes return content as a list of parts instead of
    a plain string. Normalize either shape into a single string."""
    if isinstance(content, list):
        return "".join(
            part if isinstance(part, str) else part.get("text", "")
            for part in content
        )
    return content


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/index")
def index(payload: IndexRequest) -> dict[str, object]:
    try:
        chunk_count = index_document(payload.document_id, payload.text)
        return {"status": "indexed", "chunks": chunk_count}
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Gemini embedding call failed",
                "detail": str(exc),
            },
        )


@app.post("/summarize")
def summarize(payload: SummarizeRequest) -> dict[str, str]:
    try:
        model = get_chat_model()
        prompt = (
            "Summarize the following document in 3-5 concise sentences. "
            "Focus on the key ideas and do not invent details.\n\n"
            f"Document ID: {payload.document_id}\n\n"
            f"Text:\n{payload.text}"
        )
        response = model.invoke(prompt)
        summary = extract_text(response.content).strip()
        return {"summary": summary}
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Gemini LLM call failed",
                "detail": str(exc),
            },
        )


@app.post("/qna")
def qna(payload: QnaRequest) -> dict[str, object]:
    try:
        index_document(payload.document_id, payload.text)

        retriever = get_retriever(payload.document_id, k=4)
        sources = retriever.invoke(payload.question)
        context = "\n\n".join(
            f"Chunk {position + 1}: {source.page_content}"
            for position, source in enumerate(sources)
        )

        model = get_chat_model()
        prompt = (
            "Answer the question using only the provided context. "
            "If the answer is not explicitly in the context, respond exactly with: "
            '"I don\'t have enough information". Do not use outside knowledge.\n\n'
            f"Document ID: {payload.document_id}\n"
            f"Question: {payload.question}\n\n"
            f"Context:\n{context}"
        )
        response = model.invoke(prompt)
        answer = extract_text(response.content).strip()
        return {
            "answer": answer,
            "sources_used": len(sources),
        }
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Gemini LLM call failed",
                "detail": str(exc),
            },
        )