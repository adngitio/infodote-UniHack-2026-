# Infodote — Building Digital Immunity Through Critical Thinking

> *The antidote to misinformation.*

Infodote is a real-time misinformation analysis platform built for **UniHack 2026**. It analyses any claim — a news headline, a social media post, a viral statistic — and returns not just a verdict, but a structured explanation of *why* the claim is problematic and a personalised lesson on how to recognise the same manipulation technique independently in the future.

The name is a portmanteau of **info** and **antidote**. The core thesis is that the solution to AI-generated misinformation at scale is not more fact-checkers — it is more digitally literate citizens.

---

## The Problem

In 2026, generative AI has made it trivially cheap to produce convincing misinformation at scale. A bad actor can generate thousands of plausible-sounding false claims in minutes. Traditional fact-checking tools like Snopes or PolitiFact are reactive, slow, and create dependency — they tell you something is false and cite a source, but they don't teach you why it's false or how to recognise the same pattern next time.

Infodote treats this as a public health problem analogous to vaccines. The goal is not to treat every infection individually. The goal is to build **population-level immunity** through education.

---

## What Makes Infodote Different

Most fact-checkers produce a verdict. Infodote produces a verdict **and a lesson**.

Every analysis includes a **Critical Thinking Guide** — a concise, plain-English explanation of the specific rhetorical manipulation technique used in the claim (e.g. Appeal to Fear, Cherry Picking, False Equivalence, Correlation/Causation Fallacy). The lesson explains how to spot that technique independently, without needing a tool.

This inversion — a tool designed to make itself obsolete — is the original idea behind Infodote. A regular user should need it less over time, not more.

---

## Architecture

```
User (browser)
      ↓
Next.js Frontend        (port 3000)
      ↓
FastAPI Backend         (port 8000)
      ↓              ↓
Elasticsearch       Claude API
Serverless (GCP)    (claude-haiku-4-5)
      ↓
   Kibana
(Live Dashboard)
```

---

## How It Works — Step by Step

### 1. User submits a claim

The user pastes any claim into the interface and hits Analyse. The frontend sends a `POST` request to its own same-origin proxy at `/api/analyse`, which forwards to the FastAPI backend. This proxy architecture means the browser never makes cross-origin requests directly.

### 2. Cache check

The backend first checks an in-memory cache keyed by the normalised claim text. If this claim has been analysed before in the current session, the cached result is returned instantly with no API calls. This keeps the demo fast and reliable.

### 3. Hybrid semantic search (Elasticsearch)

The claim is converted to a **384-dimensional dense vector** using the `all-MiniLM-L6-v2` sentence-transformers model, running entirely locally in approximately 20 milliseconds with no external API call. This vector is a mathematical coordinate in a high-dimensional space where semantically similar sentences cluster together.

That vector is sent to **Elasticsearch Serverless on Google Cloud Platform**, where it runs a **hybrid search** using **Reciprocal Rank Fusion (RRF)**. Two independent searches run simultaneously and their result lists are merged:

- **kNN vector search** — finds fact-checks whose *meaning* is closest to the submitted claim, regardless of word overlap. "Mobile towers linked to tumours" matches "5G causes cancer" because the semantic intent is the same.
- **BM25 keyword search** — finds fact-checks that share important *words* with the submitted claim, with fuzzy matching enabled to handle variations and typos.

RRF ranks results by their position across both lists. A fact-check that ranks highly in *both* searches rises to the top. This is fundamentally more reliable than either method alone, and it is the core technical differentiator of the system.

The search runs against **283 real-world fact-checks** sourced from the **Google Fact Check Tools API**, aggregating verified content from publishers including Full Fact, PolitiFact, Reuters Fact Check, AFP Fact Check, AAP FactCheck, FactCheck.org, and Science Feedback. These cover 41 misinformation topic categories spanning health, politics, climate, technology, and more. The top 5 matches are returned and normalised, and the top 3 are passed to Claude as grounding context.

### 4. Claude analysis

The original claim and the matched fact-checks are sent to **Claude Haiku 4.5** via the Anthropic API. Claude is prompted to act as a professional fact-checker and digital literacy expert. It returns a structured JSON response containing:

| Field | Description |
|---|---|
| `verdict` | True, False, or Misleading |
| `technique` | The specific manipulation technique or logical fallacy used |
| `explanation` | Plain-English debunking of the claim |
| `literacy_lesson` | How to spot this technique independently in the future |
| `reasoning` | Detailed logical breakdown of the factual errors |
| `bias_score` | 0–100: how ideologically slanted the claim is |
| `soundness_score` | 0–100: how logically consistent and factually supported |
| `provocation_score` | 0–100: how emotionally charged the claim is |
| `source_bias` | Estimated bias scores for each matched publisher |

The Elasticsearch sources serve as grounding context — if a directly relevant fact-check exists in the database, Claude's analysis is anchored to verified information. If no relevant sources are found, Claude still produces a full analysis using its own knowledge.

### 5. Dual storage and response

The result is stored in two places:
1. **In-memory cache** — for instant repeat retrieval
2. **`claim_analyses` index in Elasticsearch** — with a UTC timestamp, powering the Kibana dashboard

The structured response is returned to the frontend and rendered across five sections: verdict badge, technique pill, three score gauges, explanation, critical thinking guide, and verified sources.

---

## The Kibana Dashboard

Every claim submitted through Infodote is written to a dedicated `claim_analyses` index in Elasticsearch. **Kibana** connects to this index and provides a live misinformation monitoring dashboard with four panels:

- **Verdict breakdown** — the proportion of True / False / Misleading verdicts across all submissions
- **Top manipulation techniques** — which rhetorical techniques are most frequently detected, ranked by frequency
- **Average bias score** — a single number representing the mean ideological slant of all claims submitted through the tool
- **Claims over time** — submission volume as a live timeline

During a live demo, each new claim submission updates all four panels in real time. This transforms Infodote from a single-user tool into a **population-level misinformation monitoring system**.

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI, Uvicorn |
| Embedding model | sentence-transformers `all-MiniLM-L6-v2` (local, no API) |
| Vector search | Elasticsearch Serverless on GCP — kNN cosine similarity |
| Keyword search | BM25 with fuzzy matching |
| Ranking | Reciprocal Rank Fusion (RRF) |
| AI analysis | Claude Haiku 4.5 (Anthropic API) |
| Fact-check data | Google Fact Check Tools API — 283 verified claims |
| Analytics | Kibana — live dashboard on `claim_analyses` index |

---

## Running the Project

### Prerequisites

- Python 3.10+
- Node.js 18+
- An Elasticsearch Serverless project (Elastic Cloud)
- An Anthropic API key
- A Google Cloud API key with Fact Check Tools API enabled

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
ANTHROPIC_API_KEY=your_anthropic_key
ELASTIC_URL=your_elasticsearch_url
ELASTIC_API_KEY=your_elasticsearch_api_key
GOOGLE_API_KEY=your_google_api_key
```

Start the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Seed the fact-check database

Run once to populate Elasticsearch with 283 real fact-checks from the Google Fact Check Tools API:

```bash
python ingest.py
```

This queries 41 topic categories, deduplicates claims, generates vector embeddings locally, and indexes everything into Elasticsearch. Expect approximately 2–3 minutes to complete.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/analyse` | POST | Analyse a claim. Body: `{ "claim": "..." }` |
| `/health` | GET | Health check — returns Elasticsearch status |
| `/api-status` | GET | Detailed configuration and connection status |
| `/clear-cache` | POST | Clear the server-side analysis cache |
| `/create-news-claims-index` | POST | Create the `news_claims` index (setup utility) |

---

## Project Structure

```
infodote-UniHack-2026-/
├── backend/
│   ├── main.py          # FastAPI application — analysis pipeline
│   ├── ingest.py        # Data ingestion — Google API → Elasticsearch
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Main application page
│   │   └── api/
│   │       ├── analyse/route.ts        # Proxy to backend /analyse
│   │       └── clear-cache/route.ts    # Proxy to backend /clear-cache
│   ├── components/
│   │   ├── claim-input.tsx
│   │   ├── analysis-result.tsx
│   │   ├── history-sidebar.tsx
│   │   ├── settings-panel.tsx
│   │   ├── source-card.tsx
│   │   ├── verdict-badge.tsx
│   │   ├── technique-pill.tsx
│   │   ├── score-gauge.tsx
│   │   └── example-chips.tsx
│   └── lib/
│       ├── api.ts                # API client + cache
│       └── settings-context.tsx  # Global settings state
└── README.md
```

---

## Prize Targets

**Best Use of Elastic Technology** — Elasticsearch is the architectural centrepiece. The hybrid search using RRF is a non-trivial implementation of Elasticsearch's native multi-retriever ranking system, combining semantic vector search and BM25 keyword matching simultaneously. The dual-index design (`news_claims` for retrieval, `claim_analyses` for analytics) demonstrates Elasticsearch as both a search engine and a data persistence layer. The Kibana dashboard completes the full Elastic stack story.

**Quantium AI Solutions Prize** — Claude is central to every single analysis. Every submitted claim is sent to the Anthropic API with both the raw text and Elasticsearch-grounded context. Claude synthesises these into a structured verdict, explanation, and literacy lesson. The quality of the analysis is entirely Claude's work.

**EU Shared Future Prize** — Democratic stability depends on citizens being able to distinguish reality from manufactured noise. Infodote addresses this at the individual level through the literacy lesson, and at the population level through the Kibana dashboard — where it is possible to see which manipulation techniques are most prevalent, how biased circulating claims are, and whether provocation is trending upward over time.

**Most Creative Idea** — The antidote metaphor is structurally embedded in the product. Every analysis includes a literacy lesson not because it makes the tool more useful in the moment, but because it makes the user less dependent on the tool over time. A tool designed to make itself obsolete is the original idea.

---

*Infodote — UniHack 2026*
