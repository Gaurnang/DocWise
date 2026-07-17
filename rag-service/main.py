import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from rag.indexer import index_document


load_dotenv()

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
    raise HTTPException(
        status_code=501,
        detail="Summarization is not implemented yet.",
    )


@app.post("/qna")
def qna(payload: QnaRequest) -> dict[str, str]:
    raise HTTPException(
        status_code=501,
        detail="Q&A is not implemented yet.",
    )
