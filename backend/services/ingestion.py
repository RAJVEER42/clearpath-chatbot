import os
import re
import glob
import fitz


def _looks_like_title(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if not re.search(r"[A-Za-z]", stripped):
        return False
    if re.fullmatch(r"[\d\W]+", stripped):
        return False
    return True


def extract_text_from_pdf(pdf_path: str) -> list[dict]:
    doc = fitz.open(pdf_path)
    source_doc = os.path.basename(pdf_path)
    blocks_out: list[dict] = []

    for page_index, page in enumerate(doc, start=1):
        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            if block.get("type", 0) != 0:
                continue
            parts: list[str] = []
            max_size = 0.0
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    span_text = span.get("text", "")
                    if span_text:
                        parts.append(span_text)
                    size = span.get("size", 0.0)
                    if size > max_size:
                        max_size = float(size)
            block_text = " ".join(parts).strip()
            if not block_text:
                continue
            is_header = max_size > 13 and len(block_text) < 100 and _looks_like_title(block_text)
            blocks_out.append(
                {
                    "text": block_text,
                    "page": page_index,
                    "source_doc": source_doc,
                    "is_header": is_header,
                    "font_size": max_size,
                }
            )

    doc.close()
    return blocks_out


def _short_doc_name(filename: str) -> str:
    base = os.path.splitext(filename)[0]
    parts = base.split("_")
    while parts and parts[0].isdigit():
        parts = parts[1:]
    parts = [p for p in parts if not p.isdigit()]
    if parts and parts[-1].lower() in {
        "sheet",
        "guide",
        "manual",
        "overview",
        "reference",
        "details",
        "matrix",
        "plan",
        "plans",
    }:
        parts = parts[:-1]
    if not parts:
        return "doc"
    short_parts = parts[:2]
    return "_".join(p.lower() for p in short_parts)


def chunk_text(blocks: list[dict], chunk_size: int = 500, overlap: int = 100) -> list[dict]:
    if not blocks:
        return []

    sections: list[dict] = []
    current = {
        "section": "Introduction",
        "page": None,
        "source_doc": blocks[0]["source_doc"],
        "texts": [],
    }

    for block in blocks:
        if current["page"] is None:
            current["page"] = block["page"]
        if block["is_header"]:
            if current["texts"]:
                sections.append(
                    {
                        "section": current["section"],
                        "page": current["page"],
                        "source_doc": current["source_doc"],
                        "text": " ".join(current["texts"]).strip(),
                    }
                )
            current = {
                "section": block["text"].strip(),
                "page": block["page"],
                "source_doc": block["source_doc"],
                "texts": [],
            }
            continue
        current["texts"].append(block["text"])

    if current["texts"]:
        sections.append(
            {
                "section": current["section"],
                "page": current["page"],
                "source_doc": current["source_doc"],
                "text": " ".join(current["texts"]).strip(),
            }
        )

    merged_sections: list[dict] = []
    i = 0
    while i < len(sections):
        sec = sections[i]
        word_count = len(sec["text"].split())
        if word_count < 50 and i < len(sections) - 1:
            next_sec = sections[i + 1]
            combined_text = (sec["text"] + " " + next_sec["text"]).strip()
            next_sec["text"] = combined_text
            if sec["page"] is not None and next_sec["page"] is not None:
                next_sec["page"] = min(sec["page"], next_sec["page"])
            i += 1
            continue
        merged_sections.append(sec)
        i += 1

    chunks: list[dict] = []
    for sec in merged_sections:
        text = sec["text"].strip()
        if not text:
            continue
        words = text.split()
        step = chunk_size - overlap
        if step <= 0:
            step = chunk_size
        chunk_index = 0
        doc_prefix_match = re.match(r"^(\d+)", sec["source_doc"])
        doc_prefix = doc_prefix_match.group(1) if doc_prefix_match else "00"
        short_name = _short_doc_name(sec["source_doc"])
        for start in range(0, len(words), step):
            sub_words = words[start : start + chunk_size]
            if not sub_words:
                continue
            chunk_text_str = " ".join(sub_words).strip()
            chunk_id = f"{doc_prefix}_{short_name}_p{sec['page']}_c{chunk_index}"
            chunks.append(
                {
                    "text": chunk_text_str,
                    "source_doc": sec["source_doc"],
                    "page": sec["page"],
                    "section": sec["section"] or "Introduction",
                    "chunk_id": chunk_id,
                }
            )
            chunk_index += 1

    return chunks


def ingest_all_docs(docs_dir: str) -> list[dict]:
    pdf_files = sorted(glob.glob(os.path.join(docs_dir, "*.pdf")))
    all_chunks: list[dict] = []

    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        blocks = extract_text_from_pdf(pdf_path)
        chunks = chunk_text(blocks)
        print(f"Processing {filename}... {len(chunks)} chunks")
        all_chunks.extend(chunks)

    return all_chunks
