from groq import Groq
import time
from config import settings

SYSTEM_PROMPT = """You are a helpful customer support assistant for ClearPath, a project management tool.

For greetings or casual conversation (like "hi", "hello", "hey", "thanks", "how are you"):
- Respond naturally and warmly. Do not reference documentation.
- Briefly offer to help with ClearPath questions.

For questions about ClearPath:
- Answer based ONLY on the provided context from ClearPath documentation.
- If the context doesn't contain enough information to answer, say so honestly.
- Do not make up information.

Be concise and helpful."""

_client: Groq | None = None


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def build_messages(question: str, chunks: list[dict], history: list[dict] | None = None) -> list[dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        messages.extend(history)

    if chunks:
        lines = ["--- Context from ClearPath Documentation ---", ""]
        for chunk in chunks:
            lines.append(f"[Source: {chunk['source_doc']}, Page {chunk['page']}]")
            lines.append(chunk["text"])
            lines.append("")
        lines.append("--- End of Context ---")
        lines.append("")
        lines.append(f"Question: {question}")
        user_content = "\n".join(lines).strip()
    else:
        user_content = f"No relevant documentation was found.\n\nQuestion: {question}"

    messages.append({"role": "user", "content": user_content})
    return messages


def call_llm(messages: list[dict], model: str) -> dict:
    last_exc: Exception | None = None
    for attempt in range(4):
        try:
            start = time.time()
            response = get_client().chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
                max_tokens=1024,
            )
            end = time.time()
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            answer_text = response.choices[0].message.content
            return {
                "answer": answer_text,
                "tokens_input": prompt_tokens,
                "tokens_output": completion_tokens,
                "latency_ms": int((end - start) * 1000),
            }
        except Exception as exc:
            last_exc = exc
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    if last_exc:
        raise last_exc
    raise RuntimeError("LLM call failed")
