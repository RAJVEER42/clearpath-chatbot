from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    port: int = 8000
    docs_dir: str = "../docs"
    vector_store_dir: str = "data/vector_store"
    embedding_model: str = "all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 100
    top_k: int = 5
    similarity_threshold: float = 0.3
    max_conversation_turns: int = 5

    class Config:
        env_file = "../.env"


settings = Settings()
