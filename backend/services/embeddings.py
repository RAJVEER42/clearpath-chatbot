from sentence_transformers import SentenceTransformer
import numpy as np

_model: SentenceTransformer | None = None


def get_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"Loading embedding model: {model_name}")
        _model = SentenceTransformer(model_name)
    return _model


def embed_text(text: str) -> np.ndarray:
    """Embed single text. Returns shape (384,) normalized vector."""
    model = get_model()
    return model.encode(text, normalize_embeddings=True)


def embed_batch(texts: list[str]) -> np.ndarray:
    """Embed list of texts. Returns shape (n, 384) normalized vectors."""
    model = get_model()
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=True, batch_size=64)
