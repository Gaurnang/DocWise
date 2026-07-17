import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


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


class SummarizeRequest(BaseModel):
    document_id: str
    text: str


class QnaRequest(BaseModel):
    document_id: str
    text: str
    question: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
