from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from pathlib import Path
from dotenv import load_dotenv
import anthropic
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import json
import traceback
import sys
from urllib.parse import urlparse

# Load .env from the backend directory (works regardless of cwd when starting uvicorn)
_backend_dir = Path(__file__).resolve().parent
load_dotenv(_backend_dir / ".env")

app = FastAPI(title="Infodote API", description="AI-powered debunking and digital literacy tool")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI and Search Clients (read from env after load_dotenv)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ELASTIC_URL = os.getenv("ELASTIC_URL")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")

if not ANTHROPIC_API_KEY or not ANTHROPIC_API_KEY.strip():
    raise RuntimeError(
        "ANTHROPIC_API_KEY is not set. Add it to backend/.env (no quotes needed)."
    )

CLAUDE_MODEL = "claude-haiku-4-5"
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY.strip())
_last_claude_model_used: Optional[str] = None
_last_es_error: Optional[str] = None

# Elasticsearch optional: only connect if env is set; app works without it (Claude still runs)
es: Optional[Elasticsearch] = None
if ELASTIC_URL and ELASTIC_API_KEY and str(ELASTIC_URL).strip() and str(ELASTIC_API_KEY).strip():
    try:
        es = Elasticsearch(ELASTIC_URL.strip(), api_key=ELASTIC_API_KEY.strip())
        es.ping()
        print("[Infodote] Elasticsearch connected.", flush=True)
    except Exception as e:
        _last_es_error = str(e)
        es = None
        print(f"[Infodote] Elasticsearch skipped (will run without sources): {e}", flush=True)
else:
    es = None
    print("[Infodote] Elasticsearch not configured (ELASTIC_URL/ELASTIC_API_KEY). Analysis will run without sources.", flush=True)

# Load embedding model for semantic search (local only - no API calls)
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

# In-memory cache: avoid hitting Claude for repeated claims (e.g. example chips during demo)
_analysis_cache: dict[str, dict] = {}

def _cache_key(claim: str) -> str:
    return claim.strip().lower()

class AnalysisRequest(BaseModel):
    claim: str

class SourceMatch(BaseModel):
    claim: str
    source: str
    url: str
    similarity_score: float
    bias_score: Optional[int] = 50

class AnalysisResponse(BaseModel):
    claim: str
    verdict: str
    technique: str
    explanation: str
    literacy_lesson: str
    reasoning: str
    bias_score: int
    soundness_score: int
    provocation_score: int
    sources: List[SourceMatch]

def get_claude_analysis(claim: str, context_sources: List[dict]):
    global _last_claude_model_used
    prompt = f"""
    Act as a professional fact-checker and digital literacy expert.
    Analyze the following claim: "{claim}"

    Use these search results as context if relevant:
    {json.dumps(context_sources)}

    Provide the analysis in the following JSON format ONLY:
    {{
        "verdict": "True" | "False" | "Misleading",
        "technique": "Name of scientific manipulation or logical fallacy (e.g., Cherry Picking, Red Herring, Appeal to Emotion)",
        "explanation": "Plain-English debunking of why this claim is true/false/misleading.",
        "literacy_lesson": "A short educational tip on how to spot this specific manipulation technique in the future.",
        "reasoning": "Detailed breakdown of the logical inconsistencies or factual errors found.",
        "bias_score": 0-100 (Where 100 is highly biased/partisan),
        "soundness_score": 0-100 (Logical consistency and factual support),
        "provocation_score": 0-100 (How much the claim triggers emotional reaction),
        "source_bias": {{ "hostname": 0-100 }} // Map hostnames from provided sources to bias scores
    }}
    """
    print(f"[Infodote] Calling Claude API: model={CLAUDE_MODEL}", flush=True)
    response = claude_client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )
    _last_claude_model_used = CLAUDE_MODEL
    content = next((b.text for b in response.content if b.type == "text"), "").strip()
    # Extract JSON from anywhere in the response (handles trailing text or markdown fences)
    start = content.find("{")
    end = content.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found in response: {content[:200]}")
    return json.loads(content[start:end])

@app.post("/analyse", response_model=AnalysisResponse)
async def analyse_claim(request: AnalysisRequest):
    claim = request.claim
    key = _cache_key(claim)

    # Aggressive cache: return immediately if we've seen this claim (saves Gemini API calls)
    if key in _analysis_cache:
        cached = _analysis_cache[key]
        return AnalysisResponse(**cached)

    # 1. Semantic Search for context (optional; never block Gemini)
    matches: List[dict] = []
    global _last_es_error
    _last_es_error = None
    if es is not None:
        try:
            # Check index exists first (avoid opaque kNN errors)
            index_exists = False
            try:
                index_exists = es.indices.exists(index="news_claims")
            except Exception:
                index_exists = False
            if not index_exists:
                _last_es_error = "Index 'news_claims' does not exist. Create it with a dense_vector field 'vector' (dimension 384 for all-MiniLM-L6-v2)."
                print(f"[Infodote] {_last_es_error}", flush=True)
            else:
                query_vector = embed_model.encode(claim).tolist()
                search_query = {
                    "knn": {
                        "field": "vector",
                        "query_vector": query_vector,
                        "k": 5,
                        "num_candidates": 100
                    }
                }
                res = es.search(index="news_claims", body=search_query)
                hits = res.get("hits", {}).get("hits", [])
                matches = []
                for hit in hits:
                    try:
                        src = hit.get("_source", {})
                        matches.append({
                            "claim": src.get("claim", ""),
                            "source": src.get("source", ""),
                            "url": src.get("url", ""),
                            "score": hit.get("_score", 0.0)
                        })
                    except Exception:
                        continue
                n = len(matches)
                if n == 0:
                    _last_es_error = "Index 'news_claims' exists but search returned 0 hits (empty index or wrong mapping?)."
                    print(f"[Infodote] Elasticsearch search returned 0 hits. {_last_es_error}", flush=True)
                else:
                    print(f"[Infodote] Elasticsearch search returned {n} source(s).", flush=True)
        except Exception as es_err:
            _last_es_error = f"{type(es_err).__name__}: {es_err}"
            print(f"[Infodote] Elasticsearch search failed (continuing without sources): {_last_es_error}", flush=True)

    # 2. Always call Claude (with or without source context)
    try:
        analysis = get_claude_analysis(claim, matches)
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        msg = str(e)
        if "429" in msg or "rate" in msg.lower():
            raise HTTPException(status_code=429, detail="Claude API rate limit reached. Please wait a moment and try again.")
        raise HTTPException(status_code=500, detail=msg)

    source_bias = analysis.get("source_bias", {})
    response_payload = {
        "claim": claim,
        "verdict": analysis["verdict"],
        "technique": analysis["technique"],
        "explanation": analysis["explanation"],
        "literacy_lesson": analysis["literacy_lesson"],
        "reasoning": analysis["reasoning"],
        "bias_score": analysis.get("bias_score", 50),
        "soundness_score": analysis.get("soundness_score", 50),
        "provocation_score": analysis.get("provocation_score", 50),
        "sources": [
            {
                "claim": m["claim"],
                "source": m["source"],
                "url": m["url"],
                "similarity_score": min(1.0, m["score"]),
                "bias_score": source_bias.get(urlparse(m["url"]).hostname or m["source"], source_bias.get(m["source"], 50))
            }
            for m in matches[:3]
        ]
    }
    _analysis_cache[key] = response_payload
    return AnalysisResponse(**response_payload)

@app.get("/health")
async def health_check():
    es_ok = False
    if es is not None:
        try:
            es_ok = es.ping()
        except Exception:
            pass
    return {
        "status": "healthy",
        "elasticsearch": es_ok,
        "metadata": "Infodote Analysis Engine 1.0"
    }


# Vector dimension from sentence-transformers all-MiniLM-L6-v2
VECTOR_DIM = 384

@app.post("/create-news-claims-index")
async def create_news_claims_index():
    """Create the news_claims index with dense_vector mapping so kNN search works. Safe to call if index exists."""
    if es is None:
        raise HTTPException(status_code=503, detail="Elasticsearch not configured")
    try:
        if es.indices.exists(index="news_claims"):
            return {"message": "Index 'news_claims' already exists", "created": False}
        body = {
            "mappings": {
                "properties": {
                    "claim": {"type": "text"},
                    "source": {"type": "keyword"},
                    "url": {"type": "keyword"},
                    "vector": {
                        "type": "dense_vector",
                        "dims": VECTOR_DIM,
                        "index": True,
                        "similarity": "cosine"
                    }
                }
            }
        }
        es.indices.create(index="news_claims", body=body)
        print("[Infodote] Created index 'news_claims' with vector field (dim=384). Add documents to see sources.", flush=True)
        return {"message": "Index 'news_claims' created. Add documents with claim, source, url, and vector (length 384) to see sources.", "created": True}
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api-status")
async def api_status():
    """Verify env and whether Claude has been called. No secrets exposed."""
    es_ok = False
    if es is not None:
        try:
            es_ok = es.ping()
        except Exception:
            pass
    return {
        "claude_configured": bool(ANTHROPIC_API_KEY and ANTHROPIC_API_KEY.strip()),
        "claude_model": CLAUDE_MODEL,
        "last_claude_model_used": _last_claude_model_used,
        "elastic_configured": bool(ELASTIC_URL and ELASTIC_API_KEY),
        "elasticsearch_connected": es is not None,
        "elasticsearch_reachable": es_ok,
        "last_elasticsearch_error": _last_es_error,
        "cache_size": len(_analysis_cache),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)