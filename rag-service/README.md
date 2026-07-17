# DocWise RAG Service

This is a separate FastAPI microservice for future RAG summarization and Q&A work.

## Files

- `main.py` - FastAPI app with CORS, a health check, and placeholder endpoints.
- `requirements.txt` - Python dependencies for the service.
- `.env.example` - Template for `GEMINI_API_KEY`.
- `.gitignore` - Keeps local secrets and virtual environments out of git.

## Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create your local environment file:

   ```bash
   copy .env.example .env
   ```

4. Add your Gemini API key to `.env`:

   ```env
   GEMINI_API_KEY=your_actual_key
   ```

## Run

Start the API with uvicorn:

```bash
uvicorn main:app --reload --port 8001
```

Then verify:

```bash
curl http://localhost:8001/health
```
