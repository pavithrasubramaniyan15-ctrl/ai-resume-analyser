"""
RAG Resume Advisor
LangChain + HuggingFace for retrieval-augmented resume coaching
"""
import logging
import os
from typing import Optional

logger = logging.getLogger("resumeiq.rag")

# In-memory conversation store
_conversations: dict[str, list[dict]] = {}


SYSTEM_PROMPT = """You are ResumeIQ AI, an expert career coach and resume advisor.
You have deep expertise in:
- ATS optimization and resume writing
- Technical interview preparation
- Salary negotiation
- Career growth strategy
- Job search tactics

You have access to the candidate's resume data. Always give specific, actionable advice.
Be concise, direct, and encouraging. Format responses with markdown for clarity.
"""


def _build_rag_chain(resume_context: str):
    """Build a LangChain RAG chain with resume as context document"""
    try:
        from langchain_community.vectorstores import FAISS as LCFaiss
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain.chains import ConversationalRetrievalChain
        from langchain_community.llms import HuggingFaceHub

        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = splitter.create_documents([resume_context])
        vectorstore = LCFaiss.from_documents(docs, embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

        hf_token = os.getenv("HUGGINGFACE_API_KEY")
        llm = HuggingFaceHub(
            repo_id="mistralai/Mixtral-8x7B-Instruct-v0.1",
            huggingfacehub_api_token=hf_token,
            model_kwargs={"temperature": 0.7, "max_new_tokens": 512},
        )
        chain = ConversationalRetrievalChain.from_llm(llm, retriever, return_source_documents=False)
        return chain
    except Exception as e:
        logger.warning(f"LangChain RAG chain unavailable: {e}")
        return None


def _fallback_response(message: str, resume_context: str) -> str:
    """Rule-based fallback when LLM is unavailable"""
    msg_lower = message.lower()
    if any(w in msg_lower for w in ["improve", "better", "enhance", "fix"]):
        return ("## Resume Improvement Tips\n\n"
                "1. **Quantify achievements** — Replace 'worked on X' with 'Reduced latency by 40% by optimizing X'\n"
                "2. **Keywords** — Mirror the exact language from job descriptions\n"
                "3. **Summary** — Add a 2-3 sentence professional summary targeting your ideal role\n"
                "4. **Skills section** — List your top 15-20 technical skills prominently\n"
                "5. **Action verbs** — Start every bullet with: Built, Led, Designed, Scaled, Reduced, Increased\n\n"
                "> Connect your HuggingFace API key in `.env` for personalized AI responses.")
    if any(w in msg_lower for w in ["skill", "missing", "learn"]):
        return ("## Skills to Prioritize\n\n"
                "Based on current market demand:\n\n"
                "**High ROI skills to add:**\n"
                "- Cloud (AWS/GCP) certifications\n"
                "- System design fundamentals\n"
                "- LLM/AI integration experience\n"
                "- TypeScript (if JS developer)\n\n"
                "**For senior roles:** Focus on leadership examples and system design.")
    if any(w in msg_lower for w in ["salary", "negotiat", "pay", "compensation"]):
        return ("## Salary Negotiation Strategy\n\n"
                "1. **Never give the first number** — ask for their range\n"
                "2. **Anchor high** — your first counter should be 15-20% above target\n"
                "3. **Total compensation** — negotiate equity, bonus, PTO, and signing bonus\n"
                "4. **Leverage competing offers** — even informal interest strengthens position\n"
                "5. **Timeline** — ask for 48-72 hours before deciding")
    return ("## AI Career Coach\n\n"
            "I'm your personal AI career advisor. I can help you with:\n\n"
            "- **Resume optimization** — ATS keywords, bullet rewrites, format\n"
            "- **Job targeting** — which roles fit your profile best\n"
            "- **Interview prep** — technical and behavioral question practice\n"
            "- **Salary negotiation** — strategies and market data\n\n"
            "Set `HUGGINGFACE_API_KEY` in your `.env` file for full AI-powered responses.\n"
            "Ask me anything specific about your career!")


def chat(message: str, conversation_id: str, resume_context: str = "") -> str:
    history = _conversations.get(conversation_id, [])

    # Try LangChain RAG
    if resume_context:
        chain = _build_rag_chain(resume_context)
        if chain:
            try:
                result = chain({"question": message, "chat_history": [(h["user"], h["assistant"]) for h in history[-5:]]})
                response = result.get("answer", "")
                if response:
                    history.append({"user": message, "assistant": response})
                    _conversations[conversation_id] = history
                    return response
            except Exception as e:
                logger.error(f"RAG chain error: {e}")

    # Fallback
    response = _fallback_response(message, resume_context)
    history.append({"user": message, "assistant": response})
    _conversations[conversation_id] = history
    return response
