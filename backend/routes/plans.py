from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Plan
from schemas import PlanGenerateRequest, PlanResponse
from services.context import build_context_packet
from services.ai import get_ai_response
import json
from typing import List

router = APIRouter(prefix="/plans", tags=["plans"])

@router.post("/generate", response_model=PlanResponse)
async def generate_plan(request: PlanGenerateRequest, db: Session = Depends(get_db)):
    context = build_context_packet(db)
    
    plan_prompt = (
        f"You are generating a highly structured {request.type} plan based on this prompt: '{request.prompt}'.\n"
        f"Provide the plan strictly in a format that makes sense for the user, with a definitive title at the very top. "
        f"Ensure it is highly personalized based on the provided context."
    )
    
    # We create a dummy history so the AI just gets the generation prompt
    history = []
    
    response_text = await get_ai_response(plan_prompt, context, history, db)
    
    # We could parse out the title if Claude uses markdown headers, but here we just take a default
    # title or extract the first line if it looks like a title
    lines = response_text.strip().split('\n')
    title = f"AI {request.type.capitalize()} Plan"
    if lines and len(lines[0]) < 100:
        title = lines[0].replace("#", "").strip()
        
    new_plan = Plan(
        type=request.type,
        title=title,
        content=response_text,
        is_active=False
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.get("/", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    plans = db.query(Plan).order_by(Plan.created_at.desc()).all()
    return plans

@router.patch("/{plan_id}/activate")
def activate_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    # Deactivate all others of the same type
    db.query(Plan).filter(Plan.type == plan.type).update({"is_active": False})
    
    plan.is_active = True
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    db.delete(plan)
    db.commit()
    return {"deleted": True}
