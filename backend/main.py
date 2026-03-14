from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import requests
import google.generativeai as genai
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Infodote API", description="AI-powered debunking and digital literacy tool")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI and Search Clients
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELASTIC_URL = os.getenv("ELASTIC_URL")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

es = Elasticsearch(
    ELASTIC_URL,
    api_key=ELASTIC_API_KEY
)

# Load embedding model for semantic search
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

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

def get_gemini_analysis(claim: str, context_sources: List[dict]):
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
    
    response = model.generate_content(prompt)
    try:
        # Extract JSON from response
        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        return json.loads(content)
    except:
        # Fallback if AI fails to return valid JSON
        return {
            "verdict": "Unverified",
            "technique": "Unknown",
            "explanation": "Unable to provide a detailed analysis at this time.",
            "literacy_lesson": "Always evaluate claims from multiple independent sources.",
            "reasoning": "Internal analysis error occurred.",
            "bias_score": 50,
            "soundness_score": 50,
            "provocation_score": 50,
            "source_bias": {}
        }

@app.post("/analyse", response_model=AnalysisResponse)
async def analyse_claim(request: AnalysisRequest):
    claim = request.claim
    
    try:
        # 1. Semantic Search for context
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
        matches = [
            {
                "claim": hit["_source"]["claim"],
                "source": hit["_source"]["source"],
                "url": hit["_source"]["url"],
                "score": hit["_score"]
            }
            for hit in res["hits"]["hits"]
        ]
        
        # 2. AI Reasoning with Context
        analysis = get_gemini_analysis(claim, matches)
        
        source_bias = analysis.get("source_bias", {})
        
        return {
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
                    "bias_score": source_bias.get(m["source"], 50)
                }
                for m in matches[:3] # Top 3 sources
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "elasticsearch": es.ping(),
        "metadata": "Infodote Analysis Engine 1.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)