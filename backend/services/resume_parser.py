"""
Resume Parser Service
Extracts structured data from PDF/DOCX using spaCy NLP + regex patterns
"""
import re
import uuid
import logging
from typing import Optional
from models.schemas import ResumeData, ExperienceItem, EducationItem, ProjectItem

logger = logging.getLogger("resumeiq.parser")

# --- Text extraction ---

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "\n".join(page.get_text() for page in doc)
        return text
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}, trying pdfplumber")
        try:
            import pdfplumber, io
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                return "\n".join(p.extract_text() or "" for p in pdf.pages)
        except Exception as e2:
            logger.error(f"pdfplumber also failed: {e2}")
            return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        import docx, io
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        return ""


# --- Entity extraction helpers ---

def extract_email(text: str) -> str:
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    match = re.search(r"(\+?\d[\d\s\-().]{8,15}\d)", text)
    return match.group(0).strip() if match else ""


def extract_linkedin(text: str) -> Optional[str]:
    match = re.search(r"linkedin\.com/in/[\w\-]+", text, re.IGNORECASE)
    return f"https://www.{match.group(0)}" if match else None


def extract_github(text: str) -> Optional[str]:
    match = re.search(r"github\.com/[\w\-]+", text, re.IGNORECASE)
    return f"https://www.{match.group(0)}" if match else None


TECH_SKILLS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "kotlin", "swift",
    "react", "next.js", "vue", "angular", "node.js", "express", "fastapi", "django", "flask",
    "spring", "graphql", "rest api", "grpc",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "dynamodb",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd", "github actions",
    "machine learning", "deep learning", "nlp", "bert", "transformers", "pytorch", "tensorflow",
    "scikit-learn", "pandas", "numpy", "faiss", "langchain", "openai",
    "html", "css", "tailwind", "sass", "webpack", "vite",
    "git", "linux", "bash", "microservices", "kafka", "rabbitmq",
}


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in TECH_SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill.title() if not any(c.isupper() for c in skill) else skill)
    # Also grab capitalized words after skills headers
    skill_section = re.search(r"(?i)skills?[\s:]+(.+?)(?:\n\n|\Z)", text, re.DOTALL)
    if skill_section:
        custom = re.findall(r"[A-Za-z][A-Za-z0-9#+.\- ]{1,20}", skill_section.group(1))
        found.extend([s.strip() for s in custom if len(s.strip()) > 1])
    return list(dict.fromkeys(found))[:30]  # deduplicated


def extract_name(text: str) -> str:
    """Best-effort: first two-word line at top of resume"""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:8]:
        if re.match(r"^[A-Z][a-z]+ [A-Z][a-z]+$", line):
            return line
    return lines[0] if lines else "Candidate"


def extract_experience(text: str) -> list[ExperienceItem]:
    items = []
    pattern = re.compile(
        r"(?P<title>[A-Z][a-zA-Z\s]+)\s*[|@–\-]\s*(?P<company>[A-Z][a-zA-Z\s,\.]+)\s*"
        r"(?P<start>\w+ \d{4})\s*[–\-]\s*(?P<end>(?:Present|\w+ \d{4}))",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        items.append(ExperienceItem(
            title=m.group("title").strip(),
            company=m.group("company").strip(),
            start_date=m.group("start"),
            end_date=m.group("end"),
            bullets=_extract_bullets_after(text, m.end()),
        ))
    return items[:5]


def _extract_bullets_after(text: str, pos: int) -> list[str]:
    snippet = text[pos:pos + 800]
    bullets = re.findall(r"[•\-\*]\s*(.+)", snippet)
    return [b.strip() for b in bullets[:5]]


def extract_education(text: str) -> list[EducationItem]:
    items = []
    pattern = re.compile(
        r"(?P<degree>(?:B\.?S\.?|M\.?S\.?|B\.?E\.?|M\.?E\.?|Ph\.?D|Bachelor|Master|Associate)[^,\n]+)"
        r"[,\s]+(?P<institution>[A-Z][A-Za-z\s&,\.]+)\s*"
        r"(?:(?:20|19)\d{2})?",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        year_match = re.search(r"(20|19)\d{2}", m.group(0))
        items.append(EducationItem(
            degree=m.group("degree").strip(),
            institution=m.group("institution").strip(),
            field="Computer Science",
            graduation_year=year_match.group(0) if year_match else "",
        ))
    return items[:3]


def extract_projects(text: str) -> list[ProjectItem]:
    items = []
    pattern = re.compile(
        r"(?i)projects?\s*[\:\-]?\s*\n((?:.+\n)*)",
        re.MULTILINE,
    )
    m = pattern.search(text)
    if m:
        proj_text = m.group(1)
        lines = [l.strip() for l in proj_text.split("\n") if l.strip()]
        for line in lines[:5]:
            techs = re.findall(r"\b(?:Python|JS|React|Node|FastAPI|ML|AWS|Docker)\b", line)
            items.append(ProjectItem(name=line[:60], description=line, technologies=techs))
    return items


# --- Main parse function ---

def parse_resume(file_bytes: bytes, content_type: str) -> ResumeData:
    if "pdf" in content_type.lower():
        text = extract_text_from_pdf(file_bytes)
    else:
        text = extract_text_from_docx(file_bytes)

    if not text.strip():
        raise ValueError("Could not extract text from the uploaded file.")

    resume_id = str(uuid.uuid4())
    return ResumeData(
        id=resume_id,
        name=extract_name(text),
        email=extract_email(text),
        phone=extract_phone(text),
        skills=extract_skills(text),
        experience=extract_experience(text),
        education=extract_education(text),
        projects=extract_projects(text),
        linkedin=extract_linkedin(text),
        github=extract_github(text),
        raw_text=text[:5000],
    )
