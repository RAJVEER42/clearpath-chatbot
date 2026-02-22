# ClearPath Support Chatbot

RAG-powered customer support chatbot for ClearPath project management tool. Built from scratch — no LangChain, LlamaIndex, or managed retrieval services.

**Live Demo:** [https://clearpath-chatbot-928213635181.asia-south1.run.app](https://clearpath-chatbot-928213635181.asia-south1.run.app)

## How to run locally

```bash
# Clone and setup
git clone <repo-url>
cd clearpath-chatbot

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install CPU-only PyTorch first (avoids multi-GB CUDA downloads)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install backend dependencies
pip install -r backend/requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY from https://console.groq.com

# Start backend (first run builds the vector index from 30 PDFs, takes ~30-60s)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (development)

```bash
# In a separate terminal
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Frontend (production)

```bash
cd frontend
npm install
npm run build
# Built files go to frontend/dist/ — FastAPI serves them automatically at http://localhost:8000
```

## Docker

```bash
# Build
docker build -t clearpath-chatbot .

# Run
docker run -p 8000:8000 -e GROQ_API_KEY=your_key_here clearpath-chatbot
# Open http://localhost:8000
```

## Deployment (GCP Cloud Run)

The app is deployed on Google Cloud Run using a multi-stage Docker build.

```bash
# Build for linux/amd64 (required for Cloud Run)
docker build --platform linux/amd64 -t clearpath-chatbot-amd64 .

# Tag and push to Artifact Registry
docker tag clearpath-chatbot-amd64:latest asia-south1-docker.pkg.dev/PROJECT_ID/clearpath-chatbot/app:latest
docker push asia-south1-docker.pkg.dev/PROJECT_ID/clearpath-chatbot/app:latest

# Deploy
gcloud run deploy clearpath-chatbot \
  --image=asia-south1-docker.pkg.dev/PROJECT_ID/clearpath-chatbot/app:latest \
  --region=asia-south1 \
  --port=8000 \
  --memory=2Gi \
  --cpu=1 \
  --allow-unauthenticated
```

## Models used

- `llama-3.1-8b-instant` — simple queries (greetings, single-fact lookups, short questions)
- `llama-3.3-70b-versatile` — complex queries (comparisons, complaints, multi-step reasoning)

Both via [Groq](https://console.groq.com).

## Environment config

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | API key from Groq console |
| `PORT` | No | `8000` | Backend server port |

## Architecture

Three-layer pipeline:

1. **Hybrid Retrieval Pipeline** — PDFs parsed with PyMuPDF, section-aware chunking (500 tokens, 100 overlap), embedded with `all-MiniLM-L6-v2`, dual retrieval using BM25 keyword search + FAISS semantic search (cosine similarity), results merged via Reciprocal Rank Fusion (RRF), top-k=5 with 0.3 threshold and automatic fallback
2. **Model Router** — Deterministic rule-based classifier (6 rules: word count, keywords, question marks, complaint markers, compound markers, negation patterns). No LLM calls.
3. **Output Evaluator** — Three flags: `no_context` (answered without chunks), `refusal` (LLM declined to answer), `conflicting_sources` (chunks from 3+ different documents)

## Eval harness

```bash
# With the backend running:
cd eval
python run_eval.py
# 15/15 passed
```

## Bonus challenges

- **Conversation memory** — Multi-turn context via `conversation_id`, last 5 turns preserved
- **Eval harness** — 15 automated test cases covering simple, complex, off-topic, complaints, multi-question, and edge cases
- **Hybrid retrieval** — BM25 + semantic search with RRF fusion handles typos, short queries, and keyword-heavy questions

## Known issues

- Embedding model is general-purpose, not fine-tuned for ClearPath domain vocabulary
- PDF table extraction is lossy — tabular data (pricing matrices, shortcut tables) may not retrieve well
- Conversation memory is in-memory only, lost on server restart
