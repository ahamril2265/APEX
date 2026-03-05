from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Meal
from schemas import MealCreate, MealResponse
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/meals", tags=["meals"])

@router.post("/", response_model=MealResponse)
def create_meal(meal_in: MealCreate, db: Session = Depends(get_db)):
    db_meal = Meal(**meal_in.dict())
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

@router.get("/", response_model=List[MealResponse])
def get_meals(limit: int = 30, days: int = None, db: Session = Depends(get_db)):
    query = db.query(Meal).order_by(Meal.date.desc())
    if days is not None:
        start_date = datetime.utcnow().date() - timedelta(days=days)
        query = query.filter(Meal.date >= start_date)
        
    meals = query.limit(limit).all()
    return meals

@router.delete("/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
        
    db.delete(meal)
    db.commit()
    return {"deleted": True}
