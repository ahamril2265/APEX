from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Workout, Meal
from datetime import datetime, timedelta
from typing import Dict, Any

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    # Total workouts
    total_workouts = db.query(Workout).count()

    # Workouts this week
    seven_days_ago = datetime.utcnow().date() - timedelta(days=7)
    workouts_this_week = db.query(Workout).filter(Workout.date >= seven_days_ago).count()

    # Recent Workouts (last 5)
    recent_workouts = db.query(Workout).order_by(Workout.date.desc()).limit(5).all()

    # Meals in last 7 days for averages and charts
    recent_meals = db.query(Meal).filter(Meal.date >= seven_days_ago).all()
    
    # Calculate averages
    avg_cal = 0
    avg_pro = 0
    if recent_meals:
        total_cal = sum(m.calories for m in recent_meals)
        total_pro = sum(m.protein_g for m in recent_meals)
        unique_days = len(set(m.date for m in recent_meals))
        days_div = unique_days if unique_days > 0 else 1
        avg_cal = round(total_cal / days_div)
        avg_pro = round(total_pro / days_div, 1)

    # Chart data formatting
    calories_map = {}
    protein_map = {}
    
    # Initialize last 7 days with 0s
    for i in range(7):
        d = (datetime.utcnow().date() - timedelta(days=6-i)).strftime("%Y-%m-%d")
        calories_map[d] = 0
        protein_map[d] = 0.0

    for m in recent_meals:
        date_str = m.date.strftime("%Y-%m-%d")
        if date_str in calories_map:
            calories_map[date_str] += m.calories
            protein_map[date_str] += m.protein_g

    cal_chart = [{"date": k, "calories": v} for k, v in calories_map.items()]
    pro_chart = [{"date": k, "protein": round(v, 1)} for k, v in protein_map.items()]

    # Streak logic (basic implementation)
    # Check if a workout occurred today, if so start streak at 1, then check yesterday...
    # For a real implementation, we'd loop through unique dates descending.
    all_workout_dates = sorted(list(set(w.date for w in db.query(Workout.date).all())), reverse=True)
    streak = 0
    current_date_check = datetime.utcnow().date()
    
    if all_workout_dates:
        if all_workout_dates[0] == current_date_check:
            streak = 1
            current_date_check -= timedelta(days=1)
            for d in all_workout_dates[1:]:
                if d == current_date_check:
                    streak += 1
                    current_date_check -= timedelta(days=1)
                else:
                    break
        elif all_workout_dates[0] == current_date_check - timedelta(days=1):
            streak = 1
            current_date_check -= timedelta(days=2)
            for d in all_workout_dates[1:]:
                if d == current_date_check:
                    streak += 1
                    current_date_check -= timedelta(days=1)
                else:
                    break

    return {
        "total_workouts": total_workouts,
        "workouts_this_week": workouts_this_week,
        "current_streak_days": streak,
        "avg_daily_calories_7d": avg_cal,
        "avg_daily_protein_7d": avg_pro,
        "recent_workouts": [
            {
                "id": w.id,
                "date": w.date.strftime("%Y-%m-%d"),
                "name": w.name,
                "duration_minutes": w.duration_minutes
            } for w in recent_workouts
        ],
        "calories_last_7_days": cal_chart,
        "protein_last_7_days": pro_chart
    }
