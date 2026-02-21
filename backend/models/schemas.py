from pydantic import BaseModel
from typing import Optional


class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None


class TokenUsage(BaseModel):
    input: int
    output: int


class Metadata(BaseModel):
    model_used: str
    classification: str
    tokens: TokenUsage
    latency_ms: int
    chunks_retrieved: int
    evaluator_flags: list[str]


class Source(BaseModel):
    document: str
    page: Optional[int] = None
    relevance_score: Optional[float] = None


class QueryResponse(BaseModel):
    answer: str
    metadata: Metadata
    sources: list[Source]
    conversation_id: str
