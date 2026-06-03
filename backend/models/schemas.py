from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class ExperienceItem(BaseModel):
    company: str
    title: str
    start_date: str
    end_date: str
    bullets: List[str] = []


class EducationItem(BaseModel):
    institution: str
    degree: str
    field: str
    graduation_year: str
    gpa: Optional[str] = None


class ProjectItem(BaseModel):
    name: str
    description: str
    technologies: List[str] = []
    url: Optional[str] = None


class ResumeData(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    skills: List[str] = []
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    summary: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    raw_text: Optional[str] = None


class ATSResult(BaseModel):
    overall_score: int
    semantic_score: int
    keyword_score: int
    format_score: int
    experience_score: int
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    suggestions: List[str] = []
    ats_friendly: bool


class JobMatch(BaseModel):
    id: str
    title: str
    company: str
    location: str
    match_score: int
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    description_snippet: str
    apply_url: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = "Full-time"


class AnalyzeResponse(BaseModel):
    resume: ResumeData
    ats_result: ATSResult
    job_matches: List[JobMatch] = []
    processing_time_ms: int


class BulletRewriteRequest(BaseModel):
    bullet: str
    role: str
    context: Optional[str] = None


class BulletRewriteResponse(BaseModel):
    original: str
    rewritten: List[str]
    explanation: str


class ChatRequest(BaseModel):
    message: str
    resume_id: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sources: List[str] = []
