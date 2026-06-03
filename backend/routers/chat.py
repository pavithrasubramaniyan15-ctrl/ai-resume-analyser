"""Chat router — RAG-powered AI career coach"""
import uuid
from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from services.rag_advisor import chat
from routers.resume import _analyses

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(req: ChatRequest):
    conv_id = req.conversation_id or str(uuid.uuid4())

    # Build resume context for RAG
    resume_context = ""
    if req.resume_id:
        data = _analyses.get(req.resume_id)
        if data:
            r = data["resume"]
            resume_context = (
                f"Candidate: {r.name}\n"
                f"Skills: {', '.join(r.skills)}\n"
                f"Experience: {'; '.join(f'{e.title} at {e.company}' for e in r.experience)}\n"
                f"Education: {'; '.join(f'{e.degree} from {e.institution}' for e in r.education)}\n"
                f"Raw text: {r.raw_text or ''}"
            )

    response = chat(req.message, conv_id, resume_context)
    return ChatResponse(response=response, conversation_id=conv_id)


@router.get("/history/{conversation_id}")
async def get_history(conversation_id: str):
    from services.rag_advisor import _conversations
    history = _conversations.get(conversation_id, [])
    return {"conversation_id": conversation_id, "messages": history}
