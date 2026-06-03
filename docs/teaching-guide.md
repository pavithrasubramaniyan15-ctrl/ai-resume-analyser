# ResumeIQ AI — Complete Teaching Guide (Phase 2)

---

## 1. Frontend From Scratch

### What is Next.js?
Next.js is a React framework that adds:
- **File-based routing**: `src/app/page.tsx` → `/`, `src/app/about/page.tsx` → `/about`
- **Server-side rendering** (SSR) and static generation (SSG)
- **API routes** for backend logic within the same project
- **Image optimization**, font loading, and performance tools

### What is React?
React is a JavaScript library for building UIs from **components** — reusable pieces of UI. Each component:
1. Receives **props** (inputs from parent)
2. Maintains **state** (internal data that triggers re-renders)
3. Returns **JSX** (HTML-like syntax compiled to JavaScript)

### Components in This Project
```
page.tsx           → Full page components (routes)
ResumeUploader     → Dropzone + progress steps
ATSScore           → Score ring + breakdown
JobMatcher         → Job cards grid
ChatAssistant      → Message bubble list + input
```

### Routing
```
/ → app/page.tsx (landing)
/analyze → app/analyze/page.tsx (upload flow)
/dashboard → app/dashboard/page.tsx (results)
/jobs → app/jobs/page.tsx (job matches)
/chat → app/chat/page.tsx (AI coach)
```

### State Management with Zustand
```typescript
// Define store
const useResumeStore = create((set) => ({
  resumeData: null,
  setResumeData: (data) => set({ resumeData: data }),
}))

// Use in component
const { resumeData, setResumeData } = useResumeStore()
```
Zustand is simpler than Redux — no actions, reducers, or boilerplate. Just define state and setters.

### API Integration with Axios
```typescript
// 1. Create instance with base URL
const api = axios.create({ baseURL: "http://localhost:8000" })

// 2. Call endpoints
const res = await api.post("/resume/analyze", formData)
const data = res.data  // typed response
```

---

## 2. Backend From Scratch

### What is FastAPI?
FastAPI is a modern Python web framework for building REST APIs. Features:
- Async support (non-blocking I/O)
- Automatic Swagger docs at `/docs`
- Pydantic validation on all inputs/outputs
- Dependency injection

### API Basics
An API (Application Programming Interface) is a contract between two systems.
- **Endpoint**: A URL that accepts requests (`POST /resume/analyze`)
- **Request**: Data sent TO the API (file, JSON body, query params)
- **Response**: Data returned BY the API (JSON)
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)

### File Upload in FastAPI
```python
from fastapi import UploadFile, File

@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()  # bytes
    # process...
    return {"result": "..."}
```

### Request Lifecycle
1. Client sends HTTP request to FastAPI
2. CORS middleware checks allowed origins
3. Router matches URL + method → handler function
4. Pydantic validates request body/params
5. Handler runs business logic
6. Response serialized to JSON and returned

---

## 3. AI From Scratch

### BERT
BERT (Bidirectional Encoder Representations from Transformers) is a neural network trained to understand language by:
1. Reading text in both directions simultaneously
2. Predicting masked words in sentences
3. Determining if two sentences follow each other

The result: 768-dimensional vectors that capture semantic meaning.

### Embeddings
An embedding is a dense vector (list of numbers) that represents text in a high-dimensional space where:
- Similar meanings → nearby vectors
- Different meanings → distant vectors

```
"Python developer" → [0.12, -0.45, 0.89, ..., 0.33]  (768 numbers)
"Python programmer" → [0.13, -0.46, 0.87, ..., 0.31]  (very similar!)
"cooking recipe"   → [-0.78, 0.22, -0.11, ..., 0.61]  (very different)
```

### Cosine Similarity
Measures the angle between two vectors:
- 1.0 = same direction = same meaning
- 0.0 = perpendicular = unrelated
- -1.0 = opposite direction = opposite meaning

```python
from numpy import dot
from numpy.linalg import norm

similarity = dot(vecA, vecB) / (norm(vecA) * norm(vecB))
```

### Semantic Search
1. Encode all documents into embeddings (done once, cached)
2. Encode the query into an embedding (done per search)
3. Find documents whose embeddings are closest to the query
4. Return ranked by similarity score

### FAISS
Facebook's library for fast similarity search over millions of vectors.

```python
import faiss
import numpy as np

# Build index
index = faiss.IndexFlatIP(384)  # 384-dim inner product
index.add(embeddings)            # add all job embeddings

# Search
scores, indices = index.search(query_vec, k=10)  # top 10
```

### RAG (Retrieval Augmented Generation)
```
User query: "How can I improve my resume?"
     ↓
Retriever: Search resume text for relevant chunks
     ↓
Context: "Candidate has 3 years Python, no cloud experience"
     ↓
Prompt: system + context + conversation history + query
     ↓
LLM generates: "Add AWS/GCP to your skills — it's required in 73% of senior roles matching your profile"
```

### LLM Inference
```python
from huggingface_hub import InferenceClient

client = InferenceClient(token="hf_xxx")
result = client.text_generation(
    prompt="Rewrite this bullet: worked on APIs",
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
    max_new_tokens=256
)
```

---

## 4. Setup Commands Explained

### Backend
```bash
python -m venv venv
```
Creates an isolated Python environment called `venv`. Isolates packages from your system Python.

```bash
source venv/bin/activate
```
Activates the environment. Now `pip` and `python` point to the venv versions.

```bash
pip install -r requirements.txt
```
Installs all listed packages. `requirements.txt` pins exact versions for reproducibility.

```bash
python -m spacy download en_core_web_sm
```
Downloads spaCy's English language model (NER, tokenization, POS tagging).

```bash
uvicorn main:app --reload
```
- `uvicorn`: ASGI web server
- `main`: the Python file (`main.py`)
- `app`: the FastAPI instance inside it
- `--reload`: auto-restart on code changes

### Frontend
```bash
npm install
```
Reads `package.json`, downloads all packages to `node_modules/`.

```bash
npm run dev
```
Starts Next.js development server at `localhost:3000` with hot reload.

```bash
npm run build
```
Creates an optimized production build in `.next/`. Runs TypeScript check + tree-shaking.

---

## 5. File-by-File Explanation

### Frontend

| File | Purpose | Connects To |
|------|---------|-------------|
| `app/page.tsx` | Landing page with hero, features, CTA | Links to `/analyze` |
| `app/analyze/page.tsx` | Upload flow with progress steps | Calls `resumeAPI.upload()` |
| `app/dashboard/page.tsx` | Results: scores, charts, skills | Reads from Zustand store |
| `app/jobs/page.tsx` | Job match cards with filters | Calls `jobsAPI.match()` |
| `app/chat/page.tsx` | RAG chatbot interface | Calls `chatAPI.sendMessage()` |
| `store/useResumeStore.ts` | Global state (Zustand + persist) | Used by all pages |
| `lib/api.ts` | Axios API client | Backend endpoints |
| `lib/utils.ts` | Score colors, formatters | Throughout UI |
| `globals.css` | Tailwind + glassmorphism + neon | All components |

### Backend

| File | Purpose | Connects To |
|------|---------|-------------|
| `main.py` | FastAPI app, CORS, router registration | Entry point |
| `models/schemas.py` | Pydantic data models | All routers + services |
| `routers/resume.py` | `/resume/*` endpoints | resume_parser, ats_scorer |
| `routers/jobs.py` | `/jobs/*` endpoints | job_matcher |
| `routers/chat.py` | `/chat/*` endpoints | rag_advisor |
| `routers/analytics.py` | `/analytics/*` endpoints | Aggregates stored analyses |
| `services/resume_parser.py` | PDF/DOCX text extraction + NER | Called by resume router |
| `services/ats_scorer.py` | 4-dimensional ATS scoring | Called by resume router |
| `services/job_matcher.py` | FAISS semantic job matching | Called by resume + jobs routers |
| `services/rag_advisor.py` | LangChain RAG chatbot | Called by chat router |

