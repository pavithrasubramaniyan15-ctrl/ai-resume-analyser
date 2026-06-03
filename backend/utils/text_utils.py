"""Text utility helpers for NLP preprocessing"""
import re
from typing import List


def clean_text(text: str) -> str:
    """Remove noise from extracted resume text"""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s@.+#/()-]", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks for RAG"""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks


def extract_years_of_experience(text: str) -> int:
    """Estimate total years of experience from resume text"""
    import re
    year_patterns = re.findall(r"(20\d{2}|19\d{2})", text)
    if len(year_patterns) >= 2:
        years = sorted(set(int(y) for y in year_patterns))
        return max(0, years[-1] - years[0])
    return 0
