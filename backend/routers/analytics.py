"""Analytics router — dashboard stats and skills gap analysis"""
from fastapi import APIRouter
from routers.resume import _analyses

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard():
    total = len(_analyses)
    scores = [d["ats"].overall_score for d in _analyses.values()]
    avg_score = int(sum(scores) / len(scores)) if scores else 0
    all_missing = []
    for d in _analyses.values():
        all_missing.extend(d["ats"].missing_keywords)
    from collections import Counter
    top_missing = [{"skill": k, "count": v} for k, v in Counter(all_missing).most_common(10)]
    return {
        "total_analyzed": total,
        "average_ats_score": avg_score,
        "top_missing_skills": top_missing,
        "score_distribution": _score_dist(scores),
    }


@router.get("/skills-gap/{resume_id}")
async def skills_gap(resume_id: str):
    from fastapi import HTTPException
    data = _analyses.get(resume_id)
    if not data:
        raise HTTPException(404, "Resume not found")
    ats = data["ats"]
    resume = data["resume"]
    return {
        "current_skills": resume.skills,
        "missing_keywords": ats.missing_keywords,
        "matched_keywords": ats.matched_keywords,
        "improvement_potential": 100 - ats.overall_score,
    }


def _score_dist(scores):
    dist = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
    for s in scores:
        if s >= 80: dist["excellent"] += 1
        elif s >= 60: dist["good"] += 1
        elif s >= 40: dist["fair"] += 1
        else: dist["poor"] += 1
    return dist
