**Q1 - Routing Logic**
I route with six deterministic rules:
1. R1: Long queries (>= 15 words).
2. R2: Complex intent keywords ("explain", "why", "how does", "compare", "difference", "versus", "vs", "troubleshoot", "debug", "configure", "set up", "migrate", "integrate").
3. R3: Multiple question marks (>= 2).
4. R4: Complaint/frustration markers ("not working", "broken", "issue", "problem", "error", "bug", "can't", "cannot", "won't", "failed", "frustrated").
5. R5: Conditional/compound markers ("if ", " but ", "however", "although", "instead", "rather", "whereas").
6. R6: Negation confusion patterns ("don't understand", "doesn't work", "not sure").

The 15-word boundary: "15 words catches most multi-clause queries while letting short questions through. The keyword lists target ClearPath-specific intents like troubleshooting, migration, and integration." A misclassification I saw: "What are all the Pro plan features?" gets classified as simple (9 words, no complex keywords), but it actually needs to pull from multiple docs (Pricing, Feature Comparison, User Guide) to give a complete answer. The 8B model gave a partial answer missing some features. I would improve this by adding a TF-IDF scoring step - queries with rare terms suggesting niche topics would get routed to complex. I'd also track which query patterns frequently trigger evaluator flags and auto-promote those patterns.

**Q2 - Retrieval Failures**
A concrete failure happened with the query: "What keyboard shortcut opens the command palette?" The retriever pulled chunks from the Keyboard Shortcuts document, but the specific shortcut and its description were in a table. PyMuPDF extracts tables as disconnected text blocks, so "Cmd+K" and "Open command palette" ended up in different blocks and then in different chunks. The chunk that contained "Cmd+K" had no descriptive context, and the chunk that contained "Open command palette" had no keybinding, so the LLM couldn't confidently answer. I could see this in the retrieved context: relevant-sounding text was present, but the semantic link was broken by the PDF-to-text step. The failure wasn't in embeddings or FAISS; it was upstream in parsing. The fix I'd implement is a table-aware extractor (or a PDF pre-processor that detects table regions) and converts tables into structured markdown rows before chunking. That would keep key and description in the same chunk and make retrieval robust for shortcuts, pricing tables, and feature matrices.

**Q3 - Cost and Scale**
At 5,000 queries per day with a 60/40 split, I get 3,000 simple and 2,000 complex queries. If simple queries average ~600 input tokens and ~150 output tokens, that's 1.8M input and 450K output tokens/day. Complex queries at ~1,200 input and ~300 output tokens yield 2.4M input and 600K output tokens/day. Total: 4.2M input + 1.05M output tokens/day. The biggest cost driver is complex queries on the 70B model: 2.4M input tokens/day, which is about 57% of total input cost. The highest-ROI change is a semantic cache: hash query embeddings and, if a new query is >0.95 cosine similar to a cached one, return the cached response. Support traffic is repetitive, so I'd expect a 30-40% hit rate, saving ~1.5M tokens/day. The optimization I would avoid is reducing chunk count below 3. It saves tokens, but multi-fact questions degrade badly, and the evaluator would start flagging more responses.

**Q4 - What Is Broken**
The most significant flaw is that conversation memory is entirely in-memory — a Python dict keyed by `conversation_id`. When the Cloud Run container restarts (which happens on every cold start since `min-instances=0`), all conversation history is lost. In a real deployment, a user mid-conversation would suddenly lose all context, and the chatbot would start responding as if it's a fresh session. This is not a polish issue — it directly breaks the multi-turn experience. I shipped with it because adding a database (Redis or Firestore) introduces infrastructure complexity and cost that didn't fit the scope of a take-home. The in-memory approach works for demonstrating the feature and passing evaluation. The fix is straightforward: use Redis or Cloud Firestore as the backing store for `_conversations`. The `memory.py` interface (`get_or_create_id`, `get_history`, `add_turn`) wouldn't change — only the storage backend would swap from `dict` to a key-value store. This also solves the horizontal scaling problem: with multiple Cloud Run instances, each container currently has its own memory, so a user's requests could hit different containers and see different histories. A shared store fixes both problems at once.

## AI Usage

Prompts used during development:

1. "how to extract text from pdf with pymupdf, need font sizes for headers"
2. "faiss inner product vs l2 for cosine similarity with normalized vectors"
3. "fastapi lifespan context manager startup shutdown example"
4. "groq python sdk chat completion with token usage"
5. "pydantic-settings load env file with nested config"
6. "sentence-transformers normalize_embeddings parameter"
7. "react-markdown custom components for code blocks"
8. "tailwind css oklch color variables dark mode"
