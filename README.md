# ClearPath Support Chatbot

RAG-powered customer support chatbot for ClearPath project management tool. Built from scratch — no LangChain, LlamaIndex, or managed retrieval services.

**🌐 Live Demo:** [https://clearpath-chatbot-928213635181.asia-south1.run.app](https://clearpath-chatbot-928213635181.asia-south1.run.app)

## How to run locally

```bash
# Clone and setup
git clone https://github.com/RAJVEER42/clearpath-chatbot.git
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

### Docker

```bash
docker build -t clearpath-chatbot .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key_here clearpath-chatbot
# Open http://localhost:8000
```

## Models used

| Model | Groq model string | Used for |
|-------|-------------------|----------|
| Llama 3.1 8B | `llama-3.1-8b-instant` | Simple queries — greetings, single-fact lookups, yes/no |
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Complex queries — comparisons, complaints, multi-step reasoning |

## Environment config

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | API key from [Groq console](https://console.groq.com) |
| `PORT` | No | `8000` | Backend server port |

## Architecture

Three-layer pipeline:

1. **Hybrid Retrieval Pipeline** — PDFs parsed with PyMuPDF, section-aware chunking (500 tokens, 100 overlap), embedded with `all-MiniLM-L6-v2`, dual retrieval using BM25 keyword search + FAISS semantic search (cosine similarity), results merged via Reciprocal Rank Fusion (RRF), top-k=5 with 0.3 threshold and automatic fallback
2. **Model Router** — Deterministic rule-based classifier (6 rules: word count, keywords, question marks, complaint markers, compound markers, negation patterns). No LLM calls. Both models are actually used.
3. **Output Evaluator** — Three flags: `no_context` (answered without chunks), `refusal` (LLM declined to answer), `conflicting_sources` (chunks from 4+ different documents). Flags surface to the user as a warning banner.

## Eval harness

```bash
# With the backend running:
cd eval
python run_eval.py
# 15/15 passed
```

## Bonus challenges attempted

### ✅ Eval Harness
15 hand-written test queries with expected answers in `eval/run_eval.py`. Covers simple lookups, complex multi-part questions, off-topic rejection, complaints, and edge cases. Run with `cd eval && python run_eval.py` — all 15/15 pass.

### ✅ Conversation Memory
Implemented in `backend/services/memory.py`. Uses in-memory dict keyed by `conversation_id`, preserving last 5 turns per session. Design tradeoff: 5 turns keeps token cost low (~500 extra tokens per request) while still enabling follow-up questions like "tell me more about that."

### ✅ Live Deploy (GCP Cloud Run)
Deployed on Google Cloud Platform using Cloud Run + Artifact Registry in `asia-south1` (Mumbai). Multi-stage Docker build with linux/amd64 targeting. Public URL with HTTPS, auto-scaling 0→3 instances.

**Live at:** [https://clearpath-chatbot-928213635181.asia-south1.run.app](https://clearpath-chatbot-928213635181.asia-south1.run.app)

## Known issues

- Embedding model is general-purpose, not fine-tuned for ClearPath domain vocabulary
- PDF table extraction is lossy — tabular data (pricing matrices, shortcut tables) may not retrieve well
- Conversation memory is in-memory only, lost on container restart (see Q4 in Written_answers.md)
