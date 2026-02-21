from fastapi import APIRouter, HTTPException
import time
import logging
import json

from config import settings
from models.schemas import QueryRequest, QueryResponse, Source, Metadata, TokenUsage
from services import retriever, llm, evaluator, memory
from services import router as query_router

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/query", response_model=QueryResponse)
def query(request: QueryRequest) -> QueryResponse:
    question = request.question.strip() if request.question else ""
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    conversation_id = memory.get_or_create_id(request.conversation_id)
    history = memory.get_history(conversation_id, max_turns=settings.max_conversation_turns)

    classification = query_router.classify_query(question)
    model = query_router.get_model(classification)

    chunks = retriever.retrieve(
        question,
        top_k=settings.top_k,
        threshold=settings.similarity_threshold,
    )

    messages = llm.build_messages(question, chunks, history)

    try:
        llm_result = llm.call_llm(messages, model)
    except Exception:
        logger.exception("LLM call failed")
        raise HTTPException(
            status_code=503,
            detail="LLM service temporarily unavailable. Please retry.",
        )

    evaluator_flags = evaluator.evaluate_response(llm_result["answer"], chunks, question)
    memory.add_turn(conversation_id, question, llm_result["answer"])

    print(
        json.dumps(
            {
                "query": question,
                "classification": classification,
                "model_used": model,
                "tokens_input": llm_result["tokens_input"],
                "tokens_output": llm_result["tokens_output"],
                "latency_ms": llm_result["latency_ms"],
            }
        )
    )

    response = QueryResponse(
        answer=llm_result["answer"],
        metadata=Metadata(
            model_used=model,
            classification=classification,
            tokens=TokenUsage(
                input=llm_result["tokens_input"],
                output=llm_result["tokens_output"],
            ),
            latency_ms=llm_result["latency_ms"],
            chunks_retrieved=len(chunks),
            evaluator_flags=evaluator_flags,
        ),
        sources=[
            Source(
                document=c["source_doc"],
                page=c.get("page"),
                relevance_score=c.get("relevance_score"),
            )
            for c in chunks
        ],
        conversation_id=conversation_id,
    )

    return response
