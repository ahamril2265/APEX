from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Workout, WorkoutSet
from schemas import WorkoutCreate, WorkoutResponse
from typing import List

router = APIRouter(prefix="/workouts", tags=["workouts"])

@router.post("/", response_model=WorkoutResponse)
def create_workout(workout_in: WorkoutCreate, db: Session = Depends(get_db)):
    workout_data = workout_in.dict(exclude={"sets"})
    db_workout = Workout(**workout_data)
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    
    for s in workout_in.sets:
        db_set = WorkoutSet(workout_id=db_workout.id, **s.dict())
        db.add(db_set)
        
    db.commit()
    db.refresh(db_workout)
    return db_workout

@router.get("/", response_model=List[WorkoutResponse])
def get_workouts(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    workouts = db.query(Workout).order_by(Workout.date.desc()).offset(offset).limit(limit).all()
    return workouts

@router.delete("/{workout_id}")
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    db.delete(workout)
    db.commit()
    return {"deleted": True}
