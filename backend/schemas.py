from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class UserBase(BaseModel):
    name: str
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    goal: str
    fitness_level: str
    days_per_week: int
    equipment: str
    dietary_restrictions: str
    injuries: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    response: str

class ConversationResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class WorkoutSetBase(BaseModel):
    exercise: str
    sets: int
    reps: Optional[int] = None
    weight_kg: float
    notes: Optional[str] = None

class WorkoutSetCreate(WorkoutSetBase):
    pass

class WorkoutSetResponse(WorkoutSetBase):
    id: int
    workout_id: int

    class Config:
        from_attributes = True

class WorkoutBase(BaseModel):
    date: date
    name: str
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None

class WorkoutCreate(WorkoutBase):
    sets: List[WorkoutSetCreate]

class WorkoutResponse(WorkoutBase):
    id: int
    created_at: datetime
    sets: List[WorkoutSetResponse] = []

    class Config:
        from_attributes = True

class MealBase(BaseModel):
    date: date
    meal_type: str
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    notes: Optional[str] = None

class MealCreate(MealBase):
    pass

class MealResponse(MealBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PlanGenerateRequest(BaseModel):
    type: str  # workout or nutrition
    prompt: str

class PlanResponse(BaseModel):
    id: int
    type: str
    title: str
    content: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
