# infodote-UniHack-2026-

The antidote to misinformation - AI powered claim analysis.

## Running the full stack
<<<<<<< Updated upstream

=======
   # Configure .env (GEMINI_API_KEY, ELASTIC_URL, ELASTIC_API_KEY)
>>>>>>> Stashed changes
1. **Backend** (FastAPI + Elasticsearch + Gemini):
   ```bash
   cd backend
   pip install -r requirements.txt
<<<<<<< Updated upstream
   # Configure .env (GEMINI_API_KEY, ELASTIC_URL, ELASTIC_API_KEY)
=======
>>>>>>> Stashed changes
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend** (Next.js):
   ```bash
   cd frontend
   npm install && npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) (or the port shown). Submit a claim; the frontend calls the backend at `http://localhost:8000/analyse`.
