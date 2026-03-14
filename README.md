# infodote-UniHack-2026-

The antidote to misinformation - AI powered claim analysis.

## Running the full stack
1. **Backend** (FastAPI + Elasticsearch + Gemini):
   ```bash
   cd backend
   pip install -r requirements.txt
   # Configure .env (GEMINI_API_KEY, ELASTIC_URL, ELASTIC_API_KEY)
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend** (Next.js):
   ```bash
   cd frontend
   npm install && npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) (or the port shown). Submit a claim; the frontend calls the backend at `http://localhost:8000/analyse`.

## Getting "Verified Sources" to show (Elasticsearch)

Analysis and explanations always come from Gemini. **Sources** appear only when Elasticsearch has a `news_claims` index with vector-backed documents.

1. **Create the index** (run once):
   ```bash
   curl -X POST http://127.0.0.1:8000/create-news-claims-index
   ```
2. **Add documents** that include `claim`, `source`, `url`, and a `vector` (384 floats from your embedding model, e.g. `embed_model.encode(text).tolist()`). Until you index data, search will return 0 hits and the UI will show "No external sources were used...".

3. **Check why sources are empty**: see the backend terminal when you run an analysis, or:
   ```bash
   curl -s http://127.0.0.1:8000/api-status
   ```
   Use `last_elasticsearch_error` to see "index missing" vs "0 hits".
