# ── Stage 1: Build frontend ────────────────────────────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# System deps for FAISS and PyMuPDF
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first (avoids pulling CUDA libs)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy .env.example as fallback (actual keys come via docker run --env)
COPY .env.example ./.env

# Copy backend code and docs
COPY backend/ ./backend/
COPY docs/ ./docs/

# Copy built frontend into the location FastAPI expects
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose the port
ENV PORT=8000
EXPOSE 8000

# Run from inside backend/ so relative imports and paths work
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
