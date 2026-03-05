from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserResponse

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/")
def get_profile(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        return {"exists": False}
    # return the user mapped to dict; pydantic will handle it
    return user

@router.put("/")
def upsert_profile(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(**user_in.dict())
        db.add(user)
    else:
        for var, value in vars(user_in).items():
            setattr(user, var, value)
            
    db.commit()
    db.refresh(user)
    return user
