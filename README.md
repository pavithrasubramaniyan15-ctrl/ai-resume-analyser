# ResumeIQ AI 🧠

**AI-powered Resume Analyzer + Smart Job Matcher**

A production-ready full-stack SaaS platform that combines BERT embeddings, FAISS vector search, LangChain RAG, and ATS scoring to help job seekers land their dream role.

---

## Architecture

```
┌─────────────────────────────────────┐
│         Frontend (Next.js 14)        │
│  React + TypeScript + Tailwind CSS  │
│  Zustand + Framer Motion + Recharts │
└──────────────┬──────────────────────┘
               │ HTTP (Axios)
               ▼
┌─────────────────────────────────────┐
│         Backend (FastAPI)            │
│  /resume  /jobs  /chat  /analytics  │
└──────┬──────────┬───────────────────┘
       │          │
       ▼          ▼
┌────────────┐  ┌────────────────────────┐
│ NLP Stack  │  │    AI/ML Stack          │
│ spaCy      │  │ SentenceTransformers    │
│ NLTK       │  │ FAISS Vector Search     │
│ Scikit     │  │ LangChain + RAG         │
│ Regex      │  │ HuggingFace Inference   │
└────────────┘  └────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand (with persistence) |
| Charts | Recharts (RadarChart, BarChart) |
| Backend | FastAPI, Pydantic v2, Uvicorn |
| PDF Parsing | PyMuPDF, pdfplumber |
| NLP | spaCy, NLTK, scikit-learn |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) |
| Vector DB | FAISS (IndexFlatIP — cosine similarity) |
| RAG | LangChain + ConversationalRetrievalChain |
| LLM | HuggingFace Inference API (Mixtral-8x7B) |

---

## Quick Start

### 1. Clone or extract
```bash
cd resumeiq-ai
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Set environment variables
cp .env.example .env
# Edit .env with your HuggingFace API key

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Start dev server
npm run dev
```

App available at: http://localhost:3000

---

## Features

### Resume Upload & Parsing
- Drag-and-drop PDF/DOCX upload
- Text extraction via PyMuPDF + pdfplumber
- Named entity extraction: name, email, phone, skills, experience, education, projects

### ATS Scoring Engine (4-dimensional)
| Dimension | Weight | Method |
|-----------|--------|--------|
| Semantic Similarity | 35% | Sentence Transformers cosine similarity |
| Keyword Overlap | 30% | TF-IDF keyword matching |
| Format Quality | 20% | Completeness heuristics |
| Experience Quality | 15% | Bullet depth analysis |

### Smart Job Matching
- FAISS `IndexFlatIP` (inner product = cosine on normalized vectors)
- Hybrid scoring: 70% semantic + 30% keyword overlap
- Returns top 8 ranked matches with missing skills

### RAG Career Coach
- LangChain `ConversationalRetrievalChain`
- Resume text as retrieval context
- HuggingFace Mixtral-8x7B for responses
- Graceful fallback to rule-based responses

### AI Bullet Rewriter
- Action verb injection
- Quantification prompting
- STAR format enforcement

---

## Project Structure

```
resumeiq-ai/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── analyze/          # Upload + analysis flow
│   │   │   ├── dashboard/        # Results dashboard
│   │   │   ├── jobs/             # Job matches
│   │   │   └── chat/             # AI coach chatbot
│   │   ├── store/
│   │   │   └── useResumeStore.ts # Zustand global state
│   │   └── lib/
│   │       ├── api.ts            # Axios API client
│   │       └── utils.ts          # Helpers
│   ├── package.json
│   └── next.config.js
│
└── backend/
    ├── main.py                   # FastAPI app + CORS
    ├── models/
    │   └── schemas.py            # Pydantic models
    ├── routers/
    │   ├── resume.py             # Upload, analyze, rewrite
    │   ├── jobs.py               # Job matching
    │   ├── chat.py               # RAG chatbot
    │   └── analytics.py         # Dashboard stats
    └── services/
        ├── resume_parser.py      # PDF/DOCX extraction
        ├── ats_scorer.py         # ATS scoring engine
        ├── job_matcher.py        # FAISS job matching
        └── rag_advisor.py        # LangChain RAG coach
```

---

## Environment Variables

### Backend (.env)
```
HUGGINGFACE_API_KEY=hf_your_token
REDIS_URL=redis://localhost:6379   # optional
DATABASE_URL=postgresql://...       # optional
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Interview Questions & Answers

See `docs/interview-prep.md` for comprehensive interview Q&A.

