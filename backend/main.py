from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from config import settings
from routers.chat import router as chat_router
from services import ingestion, retriever, embeddings


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Starting ClearPath Chatbot...")

    base_dir = os.path.dirname(__file__)
    docs_dir = os.path.join(base_dir, settings.docs_dir)
    store_dir = os.path.join(base_dir, settings.vector_store_dir)

    if retriever.load_index(store_dir):
        logger.info("Loaded cached index.")
    else:
        logger.info("No cached index found. Building from PDFs...")
        chunks = ingestion.ingest_all_docs(docs_dir)
        logger.info(f"Total chunks: {len(chunks)}")
        retriever.build_index(chunks)
        retriever.save_index(store_dir)
        logger.info("Index built and saved.")

    embeddings.get_model(settings.embedding_model)
    logger.info("Ready to serve!")
    yield


app = FastAPI(title="ClearPath Chatbot", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
