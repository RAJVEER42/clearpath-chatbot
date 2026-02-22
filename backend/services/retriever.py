import faiss
import numpy as np
import json
import math
import re
import os
from services.embeddings import embed_batch, embed_text

_index: faiss.IndexFlatIP | None = None
_chunks: list[dict] | None = None
_bm25_corpus: list[list[str]] | None = None  # tokenized texts
_bm25_idf: dict[str, float] | None = None    # precomputed IDF


# ── tokenizer ──────────────────────────────────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    """Lowercase, strip punctuation, split on whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return [t for t in text.split() if len(t) > 1]


# ── BM25 helpers ───────────────────────────────────────────────────────────────

_BM25_K1 = 1.5
_BM25_B  = 0.75


def _build_bm25(corpus: list[list[str]]) -> dict[str, float]:
    """Compute IDF for every term in the corpus."""
    N = len(corpus)
    df: dict[str, int] = {}
    for doc in corpus:
        for term in set(doc):
            df[term] = df.get(term, 0) + 1
    idf: dict[str, float] = {}
    for term, freq in df.items():
        idf[term] = math.log((N - freq + 0.5) / (freq + 0.5) + 1)
    return idf


def _bm25_score(query_tokens: list[str], doc_tokens: list[str],
                avg_dl: float, idf: dict[str, float]) -> float:
    dl = len(doc_tokens)
    tf_map: dict[str, int] = {}
    for t in doc_tokens:
        tf_map[t] = tf_map.get(t, 0) + 1
    score = 0.0
    for term in query_tokens:
        if term not in idf:
            continue
        tf = tf_map.get(term, 0)
        numerator = tf * (_BM25_K1 + 1)
        denominator = tf + _BM25_K1 * (1 - _BM25_B + _BM25_B * dl / avg_dl)
        score += idf[term] * (numerator / denominator)
    return score


# ── index management ───────────────────────────────────────────────────────────

def build_index(chunks: list[dict]) -> None:
    global _index, _chunks, _bm25_corpus, _bm25_idf
    texts = [c["text"] for c in chunks]

    # FAISS semantic index
    vectors = embed_batch(texts)
    index = faiss.IndexFlatIP(384)
    index.add(vectors)
    _index = index
    _chunks = chunks

    # BM25 corpus
    _bm25_corpus = [_tokenize(t) for t in texts]
    _bm25_idf = _build_bm25(_bm25_corpus)


def save_index(store_dir: str) -> None:
    if _index is None or _chunks is None:
        return
    os.makedirs(store_dir, exist_ok=True)
    faiss.write_index(_index, os.path.join(store_dir, "index.faiss"))
    with open(os.path.join(store_dir, "chunks.json"), "w") as f:
        json.dump(_chunks, f)
    # Save BM25 data
    with open(os.path.join(store_dir, "bm25_corpus.json"), "w") as f:
        json.dump(_bm25_corpus, f)
    with open(os.path.join(store_dir, "bm25_idf.json"), "w") as f:
        json.dump(_bm25_idf, f)


def load_index(store_dir: str) -> bool:
    global _index, _chunks, _bm25_corpus, _bm25_idf
    index_path   = os.path.join(store_dir, "index.faiss")
    chunks_path  = os.path.join(store_dir, "chunks.json")
    corpus_path  = os.path.join(store_dir, "bm25_corpus.json")
    idf_path     = os.path.join(store_dir, "bm25_idf.json")

    if not all(os.path.isfile(p) for p in [index_path, chunks_path, corpus_path, idf_path]):
        return False

    _index = faiss.read_index(index_path)
    with open(chunks_path, "r") as f:
        _chunks = json.load(f)
    with open(corpus_path, "r") as f:
        _bm25_corpus = json.load(f)
    with open(idf_path, "r") as f:
        _bm25_idf = json.load(f)
    return True


# ── Reciprocal Rank Fusion ─────────────────────────────────────────────────────

_RRF_K = 60  # standard constant; dampens rank differences


def _rrf_fuse(semantic_ranked: list[int], bm25_ranked: list[int]) -> list[tuple[int, float]]:
    """Merge two ranked lists of chunk indices into one scored list via RRF."""
    scores: dict[int, float] = {}
    for rank, idx in enumerate(semantic_ranked):
        scores[idx] = scores.get(idx, 0.0) + 1.0 / (_RRF_K + rank + 1)
    for rank, idx in enumerate(bm25_ranked):
        scores[idx] = scores.get(idx, 0.0) + 1.0 / (_RRF_K + rank + 1)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)


# ── public API ─────────────────────────────────────────────────────────────────

def retrieve(query: str, top_k: int = 5, threshold: float = 0.3) -> list[dict]:
    if _index is None or _chunks is None or _bm25_corpus is None or _bm25_idf is None:
        return []

    # ── 1. Semantic (FAISS) ranking ─────────────────────────────────────────
    query_vec = embed_text(query).reshape(1, -1)
    n_candidates = min(len(_chunks), max(top_k * 4, 20))
    sem_scores, sem_indices = _index.search(query_vec, n_candidates)
    # Build {idx: score} for later use
    sem_score_map: dict[int, float] = {
        int(idx): float(score)
        for score, idx in zip(sem_scores[0], sem_indices[0])
        if idx >= 0
    }
    semantic_ranked = [idx for idx, _ in sorted(sem_score_map.items(),
                                                 key=lambda x: x[1], reverse=True)]

    # ── 2. BM25 ranking ─────────────────────────────────────────────────────
    query_tokens = _tokenize(query)
    avg_dl = sum(len(d) for d in _bm25_corpus) / max(len(_bm25_corpus), 1)
    bm25_scores = [
        (i, _bm25_score(query_tokens, doc, avg_dl, _bm25_idf))
        for i, doc in enumerate(_bm25_corpus)
    ]
    bm25_ranked = [idx for idx, _ in sorted(bm25_scores, key=lambda x: x[1], reverse=True)
                   if _ > 0]  # only docs with any keyword overlap

    # ── 3. Fuse via RRF ─────────────────────────────────────────────────────
    fused = _rrf_fuse(semantic_ranked, bm25_ranked)

    # ── 4. Build result list ─────────────────────────────────────────────────
    results: list[dict] = []
    for idx, rrf_score in fused[:top_k]:
        chunk = _chunks[idx]
        sem_score = sem_score_map.get(idx, 0.0)

        # Keep chunk if it passes semantic threshold OR has meaningful BM25 signal
        bm25_raw = next((s for i, s in bm25_scores if i == idx), 0.0)
        if sem_score < threshold and bm25_raw <= 0:
            continue

        results.append({
            "text": chunk["text"],
            "source_doc": chunk["source_doc"],
            "page": chunk["page"],
            "section": chunk["section"],
            "relevance_score": round(rrf_score, 4),
        })

    # ── 5. Fallback — if still empty, return best 3 by RRF regardless ───────
    if not results:
        for idx, rrf_score in fused[:3]:
            chunk = _chunks[idx]
            results.append({
                "text": chunk["text"],
                "source_doc": chunk["source_doc"],
                "page": chunk["page"],
                "section": chunk["section"],
                "relevance_score": round(rrf_score, 4),
            })

    return results


def get_index_ready() -> bool:
    return _index is not None and _chunks is not None
