"""Jobs router — semantic job matching and search"""
from fastapi import APIRouter, HTTPException
from routers.resume import _analyses
from services.job_matcher import match_jobs, SAMPLE_JOBS
import uuid

router = APIRouter()


@router.get("/match/{resume_id}")
async def get_job_matches(resume_id: str):
    data = _analyses.get(resume_id)
    if not data:
        raise HTTPException(404, "Resume not found — upload your resume first")
    matches = match_jobs(data["resume"])
    return {"matches": matches, "total": len(matches)}


@router.get("/search")
async def search_jobs(q: str = ""):
    """Search jobs by keyword"""
    q_lower = q.lower()
    results = [
        j for j in SAMPLE_JOBS
        if q_lower in j["title"].lower() or q_lower in j["company"].lower()
        or any(q_lower in s.lower() for s in j["skills"])
    ]
    return {"results": results[:10], "total": len(results)}


@router.get("/")
async def list_jobs():
    return {"jobs": SAMPLE_JOBS, "total": len(SAMPLE_JOBS)}
