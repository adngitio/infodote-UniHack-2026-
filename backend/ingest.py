import os
import json
import requests
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

ES_URL = os.getenv("ELASTIC_URL")
ES_API_KEY = os.getenv("ELASTIC_API_KEY")
INDEX_NAME = "news_claims"

es = Elasticsearch(
    ES_URL,
    api_key=ES_API_KEY
)

model = SentenceTransformer("all-MiniLM-L6-v2")

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

def create_index():
    if es.indices.exists(index=INDEX_NAME):
        print(f"Index '{INDEX_NAME}' already exists — skipping creation")
        return
    es.indices.create(index=INDEX_NAME, body=INDEX_MAPPING)
    print(f"Created index '{INDEX_NAME}'")

def load_sample_data():
    """
    Sample fact-checks to seed the database.
    In production you'd pull from ClaimBuster or PolitiFact APIs.
    """
    return [
        {"claim": "5G towers cause cancer and are linked to COVID-19", "verdict": "False", "source": "WHO", "url": "https://www.who.int"},
        {"claim": "Vaccines contain microchips for government tracking", "verdict": "False", "source": "Reuters", "url": "https://reuters.com"},
        {"claim": "The moon landing in 1969 was faked by NASA", "verdict": "False", "source": "NASA", "url": "https://nasa.gov"},
        {"claim": "Drinking bleach or disinfectant cures COVID-19", "verdict": "False", "source": "CDC", "url": "https://cdc.gov"},
        {"claim": "Climate change is a hoax invented by scientists", "verdict": "False", "source": "IPCC", "url": "https://ipcc.ch"},
        {"claim": "Eating chocolate causes acne in teenagers", "verdict": "Misleading", "source": "PolitiFact", "url": "https://politifact.com"},
        {"claim": "Australia has one of the highest vaccination rates in the world", "verdict": "True", "source": "AIHW", "url": "https://aihw.gov.au"},
        {"claim": "Ivermectin is an effective treatment for COVID-19 in humans", "verdict": "False", "source": "TGA", "url": "https://tga.gov.au"},
        {"claim": "Wind turbines cause cancer due to sound waves", "verdict": "False", "source": "NHMRC", "url": "https://nhmrc.gov.au"},
        {"claim": "Fluoride in drinking water causes brain damage", "verdict": "False", "source": "WHO", "url": "https://who.int"},
        {"claim": "COVID-19 vaccines alter your DNA permanently", "verdict": "False", "source": "CDC", "url": "https://cdc.gov"},
        {"claim": "Organic food is significantly more nutritious than conventional food", "verdict": "Misleading", "source": "PolitiFact", "url": "https://politifact.com"},
        {"claim": "Australia's Great Barrier Reef has lost 50% of its coral since 1995", "verdict": "True", "source": "ARC", "url": "https://arc.gov.au"},
        {"claim": "Humans only use 10 percent of their brain", "verdict": "False", "source": "ScienceAlert", "url": "https://sciencealert.com"},
        {"claim": "Mobile phones cause brain tumours from radiation", "verdict": "Misleading", "source": "WHO", "url": "https://www.who.int"},
        {"claim": "The Earth is only 6000 years old according to science", "verdict": "False", "source": "NASA", "url": "https://nasa.gov"},
        {"claim": "Vitamin C megadoses prevent and cure the common cold", "verdict": "Misleading", "source": "Cochrane", "url": "https://cochranelibrary.com"},
        {"claim": "Social media companies sell your private messages to advertisers", "verdict": "Misleading", "source": "ACCC", "url": "https://accc.gov.au"},
        {"claim": "Australia has the world's highest household debt levels", "verdict": "Misleading", "source": "RBA", "url": "https://rba.gov.au"},
        {"claim": "Electric vehicles produce more emissions than petrol cars over their lifetime", "verdict": "False", "source": "CSIRO", "url": "https://csiro.au"},
    ]

def ingest():
    create_index()
    data = load_sample_data()
    print(f"Embedding and ingesting {len(data)} fact-checks...")

    for i, item in enumerate(data):
        embedding = model.encode(item["claim"]).tolist()
        doc = {
            "claim": item["claim"],
            "verdict": item["verdict"],
            "source": item["source"],
            "url": item["url"],
            "vector": embedding
        }
        es.index(index=INDEX_NAME, id=str(i), document=doc)
        print(f"  [{i+1}/{len(data)}] {item['verdict']} — {item['claim'][:60]}...")

    print(f"\nDone. {len(data)} fact-checks loaded into Elasticsearch.")

if __name__ == "__main__":
    ingest()
