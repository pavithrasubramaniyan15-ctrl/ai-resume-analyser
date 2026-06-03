"""
ResumeIQ AI — FastAPI Backend
Endpoints: /resume, /jobs, /chat, /analytics
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

try:
    from .routers import resume, jobs, chat, analytics
except ImportError:
    from routers import resume, jobs, chat, analytics

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("resumeiq")

# App
app = FastAPI(
    title="ResumeIQ AI API",
    description="AI-powered resume analysis, ATS scoring, and job matching platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ResumeIQ AI"}

@app.get("/")
async def root():
    return {"message": "ResumeIQ AI API", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
