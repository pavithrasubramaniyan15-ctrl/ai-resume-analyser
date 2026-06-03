"""
ATS Scoring Engine
Combines: keyword overlap + semantic similarity (Sentence Transformers) + format checks
"""
import re
import logging
from models.schemas import ResumeData, ATSResult

logger = logging.getLogger("resumeiq.ats")

# Lazy-load heavy models
_embedder = None

def get_embedder():
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded SentenceTransformer model")
        except Exception as e:
            logger.warning(f"SentenceTransformer unavailable: {e}")
    return _embedder


def cosine_similarity(a, b) -> float:
    import numpy as np
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


def semantic_similarity_score(resume_text: str, job_text: str) -> int:
    """Encode both texts and compute cosine similarity -> 0-100 score"""
    embedder = get_embedder()
    if embedder is None or not job_text:
        return 65  # fallback
    try:
        embeddings = embedder.encode([resume_text[:2000], job_text[:2000]])
        sim = cosine_similarity(embeddings[0], embeddings[1])
        return int(min(100, max(0, sim * 100 * 1.15)))  # slight boost
    except Exception as e:
        logger.error(f"Semantic scoring failed: {e}")
        return 65


def keyword_overlap_score(resume_text: str, job_text: str) -> tuple[int, list[str], list[str]]:
    """TF-IDF style keyword matching"""
    import nltk
    from sklearn.feature_extraction.text import TfidfVectorizer

    def tokenize(t):
        words = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.\-]{1,30}\b", t.lower())
        stopwords = {"the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","can","shall","i","we","you","they","he","she","it"}
        return [w for w in words if w not in stopwords and len(w) > 2]

    resume_words = set(tokenize(resume_text))
    job_words = set(tokenize(job_text)) if job_text else set()

    if not job_words:
        # Score by completeness
        important = {"python","javascript","react","node","aws","docker","sql","git","api","ml","data"}
        matched = [w for w in important if w in resume_words]
        return min(90, 40 + len(matched) * 5), list(matched), []

    matched = list(resume_words & job_words)
    missing = list(job_words - resume_words)[:15]
    score = int(min(100, (len(matched) / max(len(job_words), 1)) * 100 * 1.2))
    return score, matched[:20], missing


def format_score(resume: ResumeData) -> int:
    """Evaluate resume completeness and formatting quality"""
    score = 50
    if resume.email: score += 8
    if resume.phone: score += 5
    if resume.linkedin: score += 5
    if resume.github: score += 5
    if resume.skills: score += min(15, len(resume.skills) * 1)
    if resume.experience: score += min(10, len(resume.experience) * 3)
    if resume.education: score += 5
    if resume.projects: score += 5
    if resume.summary: score += 5
    return min(100, score)


def experience_score(resume: ResumeData) -> int:
    score = 40
    for exp in resume.experience:
        score += 10
        score += min(20, len(exp.bullets) * 4)  # reward bullet points
    return min(100, score)


def generate_suggestions(ats: ATSResult, resume: ResumeData) -> list[str]:
    suggestions = []
    if ats.keyword_score < 70:
        suggestions.append(f"Add {len(ats.missing_keywords)} missing keywords from the job description: {', '.join(ats.missing_keywords[:5])}")
    if ats.semantic_score < 65:
        suggestions.append("Tailor your summary and experience bullets to closely mirror the job description language")
    if not resume.summary:
        suggestions.append("Add a professional summary — ATS systems score resumes with summaries 15% higher")
    if len(resume.skills) < 10:
        suggestions.append("Expand your skills section — aim for 15-20 relevant technical skills")
    if not resume.linkedin:
        suggestions.append("Include your LinkedIn URL — 87% of recruiters verify candidates on LinkedIn")
    for exp in resume.experience:
        if len(exp.bullets) < 3:
            suggestions.append(f"Add more bullet points to '{exp.title}' at {exp.company} — quantify achievements")
    if ats.overall_score < 60:
        suggestions.append("Use a clean single-column format; avoid tables, headers/footers, and graphics that confuse ATS parsers")
    suggestions.append("Start each bullet with a strong action verb (Led, Built, Improved, Reduced, Scaled)")
    return suggestions[:6]


def score_resume(resume: ResumeData, job_description: str = "") -> ATSResult:
    raw_text = resume.raw_text or f"{resume.name} {' '.join(resume.skills)} {' '.join(e.title for e in resume.experience)}"

    sem_score = semantic_similarity_score(raw_text, job_description)
    kw_score, matched_kw, missing_kw = keyword_overlap_score(raw_text, job_description)
    fmt_score = format_score(resume)
    exp_score = experience_score(resume)

    # Weighted overall: semantic 35%, keyword 30%, format 20%, experience 15%
    overall = int(sem_score * 0.35 + kw_score * 0.30 + fmt_score * 0.20 + exp_score * 0.15)

    result = ATSResult(
        overall_score=overall,
        semantic_score=sem_score,
        keyword_score=kw_score,
        format_score=fmt_score,
        experience_score=exp_score,
        matched_keywords=matched_kw[:15],
        missing_keywords=missing_kw[:12],
        ats_friendly=overall >= 60 and fmt_score >= 65,
        suggestions=[],
    )
    result.suggestions = generate_suggestions(result, resume)
    return result
