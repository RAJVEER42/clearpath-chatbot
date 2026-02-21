REFUSAL_PHRASES = [
    "i don't have", "i cannot", "i'm unable", "not mentioned",
    "cannot find", "no information available", "i don't know",
    "not covered in", "outside my knowledge", "i'm not able",
    "no relevant", "not able to find"
]

GREETING_WORDS = {
    "hi", "hello", "hey", "howdy", "greetings", "sup", "yo",
    "thanks", "thank you", "bye", "goodbye", "good morning",
    "good evening", "good afternoon", "good night",
}

CONVERSATIONAL_PHRASES = [
    "who are you", "what are you", "how are you", "what can you do",
    "what do you do", "hey there", "hi there", "hello there",
    "nice to meet", "good to see", "wassup", "what's up",
]


def _is_conversational(question: str) -> bool:
    """Check if the query is a greeting or casual conversation."""
    q = question.lower().strip().rstrip("!?.,'\"")
    # Exact greeting match
    if q in GREETING_WORDS:
        return True
    # Short query starting with a greeting word
    words = q.split()
    if len(words) <= 2 and any(g in q for g in GREETING_WORDS):
        return True
    # Contains a conversational phrase
    if any(p in q for p in CONVERSATIONAL_PHRASES):
        return True
    return False


def check_no_context(chunks_retrieved: int, answer: str) -> bool:
    """Flag: LLM produced an answer but no relevant chunks were retrieved."""
    is_refusal = any(p in answer.lower() for p in REFUSAL_PHRASES)
    return chunks_retrieved == 0 and not is_refusal


def check_refusal(answer: str) -> bool:
    """Flag: LLM explicitly said it can't answer."""
    return any(p in answer.lower() for p in REFUSAL_PHRASES)


def check_conflicting_sources(chunks: list[dict]) -> bool:
    """Flag: Retrieved chunks span 4+ different source documents.

    With top-k=5 retrieval and 30 ClearPath docs, pulling from 3 sources
    is normal (e.g. Pricing Sheet + Enterprise Plan + Feature Matrix).
    Only flag at 4+ where genuine contradiction risk is higher.
    """
    if not chunks:
        return False
    unique_docs = set(c["source_doc"] for c in chunks)
    return len(unique_docs) >= 4


def evaluate_response(answer: str, chunks: list[dict], question: str = "") -> list[str]:
    """Run all evaluator checks. Return list of flag strings."""
    if _is_conversational(question):
        return []
    flags = []
    if check_no_context(len(chunks), answer):
        flags.append("no_context")
    if check_refusal(answer):
        flags.append("refusal")
    if check_conflicting_sources(chunks):
        flags.append("conflicting_sources")
    return flags
