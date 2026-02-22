# ClearPath Support Chatbot

RAG-powered customer support chatbot for ClearPath project management tool. Built from scratch — no LangChain, LlamaIndex, or managed retrieval services.

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

1. **RAG Pipeline** — PDFs parsed with PyMuPDF, section-aware chunking (500 tokens, 100 overlap), embedded with `all-MiniLM-L6-v2`, indexed with FAISS (cosine similarity via normalized inner product), top-k=5 retrieval with 0.3 threshold
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

## Known issues

- Embedding model is general-purpose, not fine-tuned for ClearPath domain vocabulary
- PDF table extraction is lossy — tabular data (pricing matrices, shortcut tables) may not retrieve well
- Conversation memory is in-memory only, lost on server restart
