import os
import json
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
from google import genai

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

es = Elasticsearch(
    os.getenv("ELASTIC_URL"),
    api_key=os.getenv("ELASTIC_API_KEY")
)

model = SentenceTransformer("all-MiniLM-L6-v2")

INDEX_NAME = "factchecks"

class ClaimRequest(BaseModel):
    claim: str

def search_factchecks(claim: str, top_k: int = 5):
    embedding = model.encode(claim).tolist()
    response = es.search(
        index=INDEX_NAME,
        body={
            "query": {
                "match": {
                    "claim": claim
                }
            },
            "knn": {
                "field": "embedding",
                "query_vector": embedding,
                "num_candidates": 20,
                "k": top_k
            },
            "size": top_k
        }
    )
    results = []
    for hit in response["hits"]["hits"]:
        results.append({
            "claim": hit["_source"]["claim"],
            "verdict": hit["_source"]["verdict"],
            "source": hit["_source"]["source"],
            "url": hit["_source"]["url"],
            "score": hit["_score"]
        })
    return results

def analyse_with_claude(claim: str, matches: list):
    matches_text = "\n".join([
        f"- Claim: {m['claim']}\n  Verdict: {m['verdict']}\n  Source: {m['source']}"
        for m in matches
    ])

    prompt = f"""You are a misinformation analyst and digital literacy educator.

A user has submitted this claim for analysis:
"{claim}"

Here are the most semantically similar verified fact-checks from our database:
{matches_text}

Analyse the submitted claim and respond ONLY with a valid JSON object in exactly this format:
{{
    "verdict": "False|Misleading|True|Unverified",
    "confidence": <number between 0 and 100>,
    "technique": "<name of manipulation technique used, e.g. False Causation, Cherry Picking, False Authority, Emotional Manipulation, Slippery Slope, or None if claim is true>",
    "explanation": "<2-3 sentence plain English explanation of why this claim is false or misleading>",
    "literacy_lesson": "<1-2 sentence tip on how to spot this manipulation technique in the future>",
    "reasoning": "<1 sentence on how the matched fact-checks informed your verdict>"
}}

Return ONLY the JSON object. No preamble, no markdown, no extra text."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)

@app.get("/")
def root():
    return {"status": "Infodote API is running"}

@app.post("/analyse")
def analyse(request: ClaimRequest):
    claim = request.claim.strip()
    if not claim:
        return {"error": "No claim provided"}

    matches = search_factchecks(claim)
    analysis = analyse_with_claude(claim, matches)

    return {
        "claim": claim,
        "verdict": analysis["verdict"],
        "confidence": analysis["confidence"],
        "technique": analysis["technique"],
        "explanation": analysis["explanation"],
        "literacy_lesson": analysis["literacy_lesson"],
        "reasoning": analysis["reasoning"],
        "sources": [
            {
                "claim": m["claim"],
                "verdict": m["verdict"],
                "source": m["source"],
                "url": m["url"]
            }
            for m in matches[:3]
        ]
    }