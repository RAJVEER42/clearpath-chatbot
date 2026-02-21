import faiss
import numpy as np
import json
import os
from services.embeddings import embed_batch, embed_text

_index: faiss.IndexFlatIP | None = None
_chunks: list[dict] | None = None


def build_index(chunks: list[dict]) -> None:
    global _index, _chunks
    texts = [c["text"] for c in chunks]
    vectors = embed_batch(texts)
    index = faiss.IndexFlatIP(384)
    index.add(vectors)
    _index = index
    _chunks = chunks


def save_index(store_dir: str) -> None:
    if _index is None or _chunks is None:
        return
    os.makedirs(store_dir, exist_ok=True)
    faiss.write_index(_index, os.path.join(store_dir, "index.faiss"))
    with open(os.path.join(store_dir, "chunks.json"), "w") as f:
        json.dump(_chunks, f)


def load_index(store_dir: str) -> bool:
    global _index, _chunks
    index_path = os.path.join(store_dir, "index.faiss")
    chunks_path = os.path.join(store_dir, "chunks.json")
    if not (os.path.isfile(index_path) and os.path.isfile(chunks_path)):
        return False
    _index = faiss.read_index(index_path)
    with open(chunks_path, "r") as f:
        _chunks = json.load(f)
    return True


def retrieve(query: str, top_k: int = 5, threshold: float = 0.3) -> list[dict]:
    if _index is None or _chunks is None:
        return []
    query_vec = embed_text(query).reshape(1, -1)
    scores, indices = _index.search(query_vec, top_k)
    results: list[dict] = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue
        if score < threshold:
            continue
        chunk = _chunks[int(idx)]
        results.append(
            {
                "text": chunk["text"],
                "source_doc": chunk["source_doc"],
                "page": chunk["page"],
                "section": chunk["section"],
                "relevance_score": float(score),
            }
        )
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return results


def get_index_ready() -> bool:
    return _index is not None and _chunks is not None
