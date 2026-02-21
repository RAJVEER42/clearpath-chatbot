import uuid

_conversations: dict[str, list[dict]] = {}


def get_or_create_id(conversation_id: str | None) -> str:
    if conversation_id and conversation_id in _conversations:
        return conversation_id
    new_id = conversation_id or f"conv_{uuid.uuid4().hex[:12]}"
    if new_id not in _conversations:
        _conversations[new_id] = []
    return new_id


def get_history(conversation_id: str, max_turns: int = 5) -> list[dict]:
    """Return last max_turns pairs (up to max_turns*2 messages)."""
    history = _conversations.get(conversation_id, [])
    # Keep last max_turns exchanges (each exchange = 1 user + 1 assistant)
    return history[-(max_turns * 2):]


def add_turn(conversation_id: str, user_msg: str, assistant_msg: str) -> None:
    if conversation_id not in _conversations:
        _conversations[conversation_id] = []
    _conversations[conversation_id].append({"role": "user", "content": user_msg})
    _conversations[conversation_id].append({"role": "assistant", "content": assistant_msg})
