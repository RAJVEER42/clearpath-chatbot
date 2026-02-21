MODEL_MAP = {
    "simple": "llama-3.1-8b-instant",
    "complex": "llama-3.3-70b-versatile",
}

COMPLEX_KEYWORDS = [
    "explain", "why", "how does", "compare", "difference",
    "versus", "vs", "troubleshoot", "debug", "configure",
    "set up", "migrate", "integrate"
]

COMPLAINT_MARKERS = [
    "not working", "broken", "issue", "problem", "error",
    "bug", "can't", "cannot", "won't", "failed", "frustrated"
]

COMPOUND_MARKERS = ["if ", " but ", "however", "although", "instead", "rather", "whereas"]

NEGATION_PATTERNS = ["don't understand", "doesn't work", "not sure"]


def classify_query(query: str) -> str:
    """Deterministic rule-based classifier. Returns 'simple' or 'complex'."""
    words = query.lower().split()
    query_lower = query.lower()

    # R1: Long queries (>= 15 words)
    if len(words) >= 15:
        return "complex"

    # R2: Complex intent keywords
    if any(kw in query_lower for kw in COMPLEX_KEYWORDS):
        return "complex"

    # R3: Multiple question marks
    if query.count("?") >= 2:
        return "complex"

    # R4: Complaint/frustration markers
    if any(m in query_lower for m in COMPLAINT_MARKERS):
        return "complex"

    # R5: Conditional/compound logic
    if any(m in query_lower for m in COMPOUND_MARKERS):
        return "complex"

    # R6: Negation confusion patterns
    if any(p in query_lower for p in NEGATION_PATTERNS):
        return "complex"

    return "simple"


def get_model(classification: str) -> str:
    """Return Groq model string for the classification."""
    return MODEL_MAP[classification]
