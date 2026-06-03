"""
Smart Job Matcher
Uses FAISS vector search + Sentence Transformers for semantic job matching
"""
import uuid
import logging
import numpy as np
from typing import List
from models.schemas import ResumeData, JobMatch

logger = logging.getLogger("resumeiq.jobs")

# Sample job database — replace with real job board API integration
SAMPLE_JOBS = [
    {"title": "Senior Software Engineer", "company": "Stripe", "location": "Remote", "salary_range": "$160k-$220k", "job_type": "Full-time", "apply_url": "https://stripe.com/jobs",
     "description": "Build reliable, scalable payment infrastructure using Python, Go, and distributed systems. You'll design APIs, improve developer experience, and work on core platform features.",
     "skills": ["Python", "Go", "Distributed Systems", "APIs", "PostgreSQL", "Kafka", "Docker"]},
    {"title": "ML Engineer", "company": "Anthropic", "location": "San Francisco, CA", "salary_range": "$200k-$350k", "job_type": "Full-time", "apply_url": "https://anthropic.com/careers",
     "description": "Work on training, evaluation, and deployment of large language models. Experience with PyTorch, CUDA, distributed training, and transformer architectures required.",
     "skills": ["Python", "PyTorch", "Machine Learning", "NLP", "BERT", "Transformers", "CUDA", "AWS"]},
    {"title": "Full Stack Engineer", "company": "Vercel", "location": "Remote", "salary_range": "$140k-$190k", "job_type": "Full-time",
     "description": "Build the future of web development tooling. Work on Next.js, edge functions, and developer tools with TypeScript, React, and Node.js.",
     "skills": ["TypeScript", "React", "Next.js", "Node.js", "AWS", "Edge Computing"]},
    {"title": "Backend Engineer", "company": "Notion", "location": "New York, NY", "salary_range": "$150k-$200k", "job_type": "Full-time",
     "description": "Scale Notion's backend infrastructure to serve millions of users. Experience with distributed databases, caching, and microservices.",
     "skills": ["Python", "Node.js", "PostgreSQL", "Redis", "Kubernetes", "Docker", "Microservices"]},
    {"title": "AI Research Engineer", "company": "OpenAI", "location": "San Francisco, CA", "salary_range": "$250k-$400k", "job_type": "Full-time",
     "description": "Research and implement novel AI techniques. Deep knowledge of transformers, RLHF, fine-tuning, and LLM evaluation required.",
     "skills": ["Python", "PyTorch", "Machine Learning", "LLM", "RLHF", "NLP", "Research"]},
    {"title": "Data Engineer", "company": "Airbnb", "location": "Remote", "salary_range": "$130k-$175k", "job_type": "Full-time",
     "description": "Design and build robust data pipelines and ETL infrastructure. Experience with Spark, dbt, Airflow, and cloud data warehouses.",
     "skills": ["Python", "SQL", "Spark", "dbt", "Airflow", "AWS", "Redshift", "Kafka"]},
    {"title": "Frontend Engineer", "company": "Linear", "location": "Remote", "salary_range": "$140k-$180k", "job_type": "Full-time",
     "description": "Build fast, beautiful interfaces for Linear's project management platform using React, TypeScript, and WebGL.",
     "skills": ["TypeScript", "React", "CSS", "WebGL", "Performance", "Design Systems"]},
    {"title": "DevOps / Platform Engineer", "company": "GitHub", "location": "Remote", "salary_range": "$145k-$195k", "job_type": "Full-time",
     "description": "Maintain and improve GitHub's global infrastructure. Terraform, Kubernetes, and cloud infrastructure at massive scale.",
     "skills": ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Python", "Go", "Linux"]},
    {"title": "Security Engineer", "company": "Cloudflare", "location": "Austin, TX", "salary_range": "$140k-$185k", "job_type": "Full-time",
     "description": "Design security architecture for global edge network. Experience with cryptography, network security, and distributed systems.",
     "skills": ["Security", "Python", "Go", "Linux", "Networking", "Cryptography", "Rust"]},
    {"title": "NLP Engineer", "company": "Grammarly", "location": "Remote", "salary_range": "$160k-$210k", "job_type": "Full-time",
     "description": "Improve Grammarly's NLP models for grammar, style, and tone detection. Experience with BERT, fine-tuning, and production ML.",
     "skills": ["Python", "NLP", "BERT", "Transformers", "Machine Learning", "PyTorch", "spaCy"]},
]


_faiss_index = None
_job_embeddings = None
_embedder = None


def _get_embedder():
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"SentenceTransformer unavailable: {e}")
    return _embedder


def _build_faiss_index():
    global _faiss_index, _job_embeddings
    embedder = _get_embedder()
    if embedder is None:
        return None
    try:
        import faiss
        texts = [f"{j['title']} {j['company']} {j['description']} {' '.join(j['skills'])}" for j in SAMPLE_JOBS]
        _job_embeddings = embedder.encode(texts, normalize_embeddings=True)
        dim = _job_embeddings.shape[1]
        _faiss_index = faiss.IndexFlatIP(dim)  # Inner product on normalized = cosine sim
        _faiss_index.add(_job_embeddings.astype(np.float32))
        logger.info(f"FAISS index built with {len(texts)} jobs, dim={dim}")
        return _faiss_index
    except Exception as e:
        logger.warning(f"FAISS unavailable: {e}")
        return None


def _keyword_match_score(resume_skills: List[str], job_skills: List[str]) -> float:
    rs = set(s.lower() for s in resume_skills)
    js = set(s.lower() for s in job_skills)
    if not js:
        return 0.5
    return len(rs & js) / len(js)


def match_jobs(resume: ResumeData) -> List[JobMatch]:
    resume_text = f"{resume.name} {' '.join(resume.skills)} {' '.join(e.title + ' ' + e.company for e in resume.experience)}"

    # Try FAISS semantic search
    embedder = _get_embedder()
    faiss_index = _build_faiss_index() if _faiss_index is None else _faiss_index

    results = []

    if embedder and faiss_index:
        try:
            import faiss
            query_vec = embedder.encode([resume_text], normalize_embeddings=True).astype(np.float32)
            scores, indices = faiss_index.search(query_vec, len(SAMPLE_JOBS))
            for rank, (score, idx) in enumerate(zip(scores[0], indices[0])):
                job = SAMPLE_JOBS[idx]
                kw_score = _keyword_match_score(resume.skills, job["skills"])
                final_score = int((float(score) * 0.7 + kw_score * 0.3) * 100)
                final_score = max(35, min(98, final_score))
                results.append(_build_job_match(job, resume.skills, final_score))
        except Exception as e:
            logger.error(f"FAISS search failed: {e}")

    # Fallback: keyword-only scoring
    if not results:
        for job in SAMPLE_JOBS:
            kw_score = _keyword_match_score(resume.skills, job["skills"])
            score = int(40 + kw_score * 58)
            results.append(_build_job_match(job, resume.skills, score))

    results.sort(key=lambda x: x.match_score, reverse=True)
    return results[:8]


def _build_job_match(job: dict, resume_skills: List[str], score: int) -> JobMatch:
    rs = set(s.lower() for s in resume_skills)
    js_skills = job.get("skills", [])
    matched = [s for s in js_skills if s.lower() in rs]
    missing = [s for s in js_skills if s.lower() not in rs]
    return JobMatch(
        id=str(uuid.uuid4()),
        title=job["title"],
        company=job["company"],
        location=job["location"],
        salary_range=job.get("salary_range"),
        job_type=job.get("job_type", "Full-time"),
        match_score=score,
        matched_skills=matched,
        missing_skills=missing,
        description_snippet=job["description"][:200] + "...",
        apply_url=job.get("apply_url"),
    )
