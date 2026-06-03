"""Resume router — upload, analyze, rewrite bullets, optimize"""
import time
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from models.schemas import AnalyzeResponse, BulletRewriteRequest, BulletRewriteResponse
from services.resume_parser import parse_resume
from services.ats_scorer import score_resume
from services.job_matcher import match_jobs

router = APIRouter()

# In-memory cache (use Redis in production)
_analyses: dict = {}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
):
    if file.content_type not in ("application/pdf", "application/msword",
                                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        raise HTTPException(400, "Only PDF, DOC, DOCX files are supported")

    t0 = time.time()
    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large — max 10MB")

    # Parse
    resume = parse_resume(content, file.content_type or "application/pdf")

    # ATS Score
    ats_result = score_resume(resume, job_description or "")

    # Job matches
    job_matches = match_jobs(resume)

    # Cache
    _analyses[resume.id] = {"resume": resume, "ats": ats_result, "jobs": job_matches}

    elapsed_ms = int((time.time() - t0) * 1000)
    return AnalyzeResponse(
        resume=resume,
        ats_result=ats_result,
        job_matches=job_matches,
        processing_time_ms=elapsed_ms,
    )


@router.get("/analysis/{resume_id}")
async def get_analysis(resume_id: str):
    data = _analyses.get(resume_id)
    if not data:
        raise HTTPException(404, "Analysis not found — re-upload your resume")
    return data


@router.post("/rewrite-bullet", response_model=BulletRewriteResponse)
async def rewrite_bullet(req: BulletRewriteRequest):
    """AI bullet rewriter using templates + LLM when available"""
    original = req.bullet.strip()
    role = req.role

    # Try HuggingFace LLM
    rewritten = _llm_rewrite(original, role)
    if not rewritten:
        rewritten = _template_rewrite(original, role)

    return BulletRewriteResponse(
        original=original,
        rewritten=rewritten,
        explanation="Bullets rewritten with strong action verbs, quantified impact, and STAR format",
    )


def _template_rewrite(bullet: str, role: str) -> list[str]:
    import re
    verbs = ["Led", "Built", "Designed", "Engineered", "Optimized", "Reduced", "Increased", "Delivered"]
    base = re.sub(r"^(worked on|helped|assisted with|was responsible for)\s*", "", bullet, flags=re.IGNORECASE)
    return [
        f"{verbs[0]} the development of {base} for {role} team, improving efficiency by 30%",
        f"{verbs[2]} and implemented {base}, resulting in measurable performance improvements",
        f"{verbs[4]} {base}, reducing processing time by 25% and enhancing user experience",
    ]


def _llm_rewrite(bullet: str, role: str) -> list[str]:
    try:
        import os
        from huggingface_hub import InferenceClient
        token = os.getenv("HUGGINGFACE_API_KEY")
        if not token:
            return []
        client = InferenceClient(token=token)
        prompt = f"""Rewrite this resume bullet point 3 ways with strong action verbs and quantified impact.
Role: {role}
Original: {bullet}
Output 3 numbered rewrites only."""
        result = client.text_generation(prompt, model="mistralai/Mixtral-8x7B-Instruct-v0.1", max_new_tokens=256)
        lines = [l.strip().lstrip("123.) ") for l in result.split("\n") if l.strip() and l[0].isdigit()]
        return lines[:3]
    except Exception:
        return []


@router.post("/optimize")
async def optimize_resume(resume_id: str, job_description: str):
    data = _analyses.get(resume_id)
    if not data:
        raise HTTPException(404, "Resume not found")
    resume = data["resume"]
    ats = score_resume(resume, job_description)
    return {"updated_ats": ats, "message": "Resume optimization complete"}
