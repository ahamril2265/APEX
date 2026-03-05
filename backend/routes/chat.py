from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Conversation
from schemas import ChatMessageBase, ChatMessageResponse, ConversationResponse
from services.context import build_context_packet
from services.ai import get_ai_response
from typing import List

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatMessageResponse)
async def send_chat_message(chat_in: ChatMessageBase, db: Session = Depends(get_db)):
    # Fetch last 20 messages for history
    history = db.query(Conversation).order_by(Conversation.created_at.desc()).limit(20).all()
    history.reverse() # Order chronological
    
    # Format history for AI service format
    convo_history = [{"role": h.role, "content": h.content} for h in history]
    
    # Build context
    context_packet = build_context_packet(db)
    
    # Get response
    reply = await get_ai_response(chat_in.message, context_packet, convo_history, db)
    
    return {"response": reply}

@router.get("/history", response_model=List[ConversationResponse])
def get_chat_history(db: Session = Depends(get_db)):
    history = db.query(Conversation).order_by(Conversation.created_at.desc()).limit(50).all()
    history.reverse()
    return history

@router.delete("/history")
def clear_chat_history(db: Session = Depends(get_db)):
    db.query(Conversation).delete()
    db.commit()
    return {"cleared": True}
