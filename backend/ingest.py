import os
import time
import requests
from pathlib import Path
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

ES_URL = os.getenv("ELASTIC_URL")
ES_API_KEY = os.getenv("ELASTIC_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
INDEX_NAME = "news_claims"

es = Elasticsearch(ES_URL, api_key=ES_API_KEY)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Topics to query — covers the most common misinformation categories
TOPICS = [
    "vaccine safety", "COVID-19 treatment", "COVID-19 origin",
    "climate change", "global warming",
    "5G technology", "microchip vaccine",
    "election fraud", "election security",
    "cancer cure", "cancer treatment",
    "artificial intelligence danger",
    "immigration statistics",
    "ivermectin treatment", "hydroxychloroquine",
    "mask effectiveness", "lockdown effectiveness",
    "fluoride water", "GMO food safety",
    "moon landing", "flat earth",
    "autism vaccines", "childhood vaccines",
    "bleach cure", "essential oils cure",
    "wind turbines health", "solar energy",
    "electric vehicles emissions", "fossil fuels",
    "social media privacy", "government surveillance",
    "cryptocurrency fraud", "bitcoin",
    "gun violence statistics", "crime statistics",
    "nuclear energy safety", "radiation danger",
    "organic food nutrition", "vitamin supplements",
    "sunscreen cancer", "sugar health",
]

INDEX_MAPPING = {
    "mappings": {
        "properties": {
            "claim": {"type": "text"},
            "verdict": {"type": "keyword"},
            "source": {"type": "keyword"},
            "url": {"type": "keyword"},
            "vector": {
                "type": "dense_vector",
                "dims": 384,
                "index": True,
                "similarity": "cosine"
            }
        }
    }
}


def normalize_verdict(rating: str) -> str:
    """Map any textualRating string to True / False / Misleading."""
    if not rating:
        return "Misleading"
    r = rating.lower().strip()
    false_terms = [
        "false", "pants on fire", "incorrect", "wrong", "untrue",
        "fake", "fiction", "inaccurate", "fabricated", "no evidence",
        "four pinocchios", "three pinocchios", "scam", "debunked"
    ]
    true_terms = [
        "true", "correct", "right", "accurate", "verified",
        "mostly true", "largely true"
    ]
    for term in false_terms:
        if term in r:
            return "False"
    for term in true_terms:
        if term in r:
            return "True"
    return "Misleading"


def recreate_index():
    if es.indices.exists(index=INDEX_NAME):
        es.indices.delete(index=INDEX_NAME)
        print(f"Deleted existing index '{INDEX_NAME}'")
    es.indices.create(index=INDEX_NAME, body=INDEX_MAPPING)
    print(f"Created fresh index '{INDEX_NAME}'")


def fetch_claims(query: str, page_size: int = 10) -> list:
    """Fetch fact-checks from Google Fact Check Tools API for a given topic."""
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "query": query,
        "key": GOOGLE_API_KEY,
        "pageSize": page_size,
        "languageCode": "en",
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        claims = []
        for item in data.get("claims", []):
            claim_text = item.get("text", "").strip()
            if not claim_text or len(claim_text) < 15:
                continue
            reviews = item.get("claimReview", [])
            if not reviews:
                continue
            review = reviews[0]
            publisher = review.get("publisher", {})
            source_name = publisher.get("name", "Unknown")
            source_url = review.get("url", "") or publisher.get("site", "")
            claims.append({
                "claim": claim_text,
                "verdict": normalize_verdict(review.get("textualRating", "")),
                "source": source_name,
                "url": source_url,
            })
        return claims
    except Exception as e:
        print(f"  [!] Error fetching '{query}': {e}")
        return []


def ingest():
    recreate_index()

    all_claims = []
    seen = set()

    print(f"\nFetching fact-checks across {len(TOPICS)} topics...\n")
    for topic in TOPICS:
        claims = fetch_claims(topic)
        new_count = 0
        for c in claims:
            key = c["claim"].lower().strip()
            if key not in seen:
                seen.add(key)
                all_claims.append(c)
                new_count += 1
        print(f"  '{topic}' → {new_count} new claims (running total: {len(all_claims)})")
        time.sleep(0.2)  # stay well within rate limits

    print(f"\nEmbedding and indexing {len(all_claims)} unique fact-checks...")
    for i, item in enumerate(all_claims):
        embedding = model.encode(item["claim"]).tolist()
        doc = {
            "claim": item["claim"],
            "verdict": item["verdict"],
            "source": item["source"],
            "url": item["url"],
            "vector": embedding,
        }
        es.index(index=INDEX_NAME, id=str(i), document=doc)
        if (i + 1) % 25 == 0 or (i + 1) == len(all_claims):
            print(f"  [{i+1}/{len(all_claims)}] indexed")

    # Verdict breakdown summary
    verdicts = {"True": 0, "False": 0, "Misleading": 0}
    for c in all_claims:
        verdicts[c["verdict"]] = verdicts.get(c["verdict"], 0) + 1

    print(f"\nDone. {len(all_claims)} fact-checks loaded into Elasticsearch.")
    print(f"  True: {verdicts['True']}  |  False: {verdicts['False']}  |  Misleading: {verdicts['Misleading']}")


if __name__ == "__main__":
    ingest()
