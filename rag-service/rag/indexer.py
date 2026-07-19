import os
from functools import lru_cache
from typing import Any

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


from pathlib import Path
load_dotenv(Path(__file__).parent.parent / ".env")

CHROMA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
COLLECTION_NAME = "documents"
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768
CHAT_MODEL = "gemini-flash-latest"


class LoggingGoogleGenerativeAIEmbeddings(GoogleGenerativeAIEmbeddings):
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        embeddings = super().embed_documents(
            texts,
            output_dimensionality=EMBEDDING_DIMENSION,
        )

        if embeddings:
            preview = embeddings[0][:5]
            print(
                f"Gemini embedding preview (first 5 dimensions): {preview}",
                flush=True,
            )

        return embeddings

    def embed_query(self, text: str) -> list[float]:
        embedding = super().embed_query(
            text,
            output_dimensionality=EMBEDDING_DIMENSION,
        )
        print(
            f"Gemini embedding preview (first 5 dimensions): {embedding[:5]}",
            flush=True,
        )
        return embedding


@lru_cache(maxsize=1)
def get_embeddings() -> Any:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    return LoggingGoogleGenerativeAIEmbeddings(
        model=EMBEDDING_MODEL,
        api_version="v1",
    )


@lru_cache(maxsize=1)
def get_vector_store() -> Chroma:
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_DIR,
    )


@lru_cache(maxsize=1)
def get_chat_model() -> ChatGoogleGenerativeAI:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    return ChatGoogleGenerativeAI(
        model=CHAT_MODEL,
        
    )


def index_document(document_id: str, text: str) -> int:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    documents = [
        Document(
            page_content=chunk,
            metadata={"document_id": document_id, "chunk_index": index},
        )
        for index, chunk in enumerate(chunks)
    ]

    vector_store = get_vector_store()
    vector_store.add_documents(documents)

    return len(documents)


def get_retriever(document_id: str, k: int = 4):
    return get_vector_store().as_retriever(
        search_kwargs={
            "k": k,
            "filter": {"document_id": document_id},
        }
    )
