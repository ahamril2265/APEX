from sqlalchemy.orm import Session
from models import User, Workout, Meal, Plan
from datetime import datetime, timedelta

def build_context_packet(db: Session) -> str:
    user = db.query(User).first()
    if not user:
        return "No user profile set up yet."

    # Top 10 workouts
    workouts = db.query(Workout).order_by(Workout.date.desc()).limit(10).all()
    
    # Meals in last 7 days
    seven_days_ago = datetime.utcnow().date() - timedelta(days=7)
    recent_meals = db.query(Meal).filter(Meal.date >= seven_days_ago).order_by(Meal.date.desc()).all()
    
    # Active plan
    active_plan = db.query(Plan).filter(Plan.is_active == True).first()

    # Format Workouts
    workouts_str = ""
    for w in workouts:
        workouts_str += f"{w.date} - {w.name} ({w.duration_minutes or 0} min)\n"
        workouts_str += "  Exercises:\n"
        for s in w.sets:
            reps_str = str(s.reps) if s.reps else "time-based"
            workouts_str += f"    {s.exercise}: {s.sets} x {reps_str} @ {s.weight_kg}kg\n"

    # Format Nutrition
    avg_cal, avg_p, avg_c, avg_f = 0, 0, 0, 0
    meals_str = ""
    if recent_meals:
        total_cal = sum(m.calories for m in recent_meals)
        total_p = sum(m.protein_g for m in recent_meals)
        total_c = sum(m.carbs_g for m in recent_meals)
        total_f = sum(m.fat_g for m in recent_meals)
        
        # approximate days logged
        unique_days = len(set(m.date for m in recent_meals))
        days_div = unique_days if unique_days > 0 else 1
        
        avg_cal = round(total_cal / days_div)
        avg_p = round(total_p / days_div, 1)
        avg_c = round(total_c / days_div, 1)
        avg_f = round(total_f / days_div, 1)

        for m in recent_meals:
            meals_str += f"  {m.date} {m.meal_type}: {m.name} — {m.calories}kcal, P:{m.protein_g}g C:{m.carbs_g}g F:{m.fat_g}g\n"

    plan_str = "No active plan set"
    if active_plan:
        plan_str = f"{active_plan.title}\n{active_plan.content}"

    packet = f"""=== USER PROFILE ===
Name: {user.name} | Age: {user.age} | Gender: {user.gender}
Height: {user.height_cm}cm | Weight: {user.weight_kg}kg
Goal: {user.goal} | Fitness Level: {user.fitness_level}
Training Days/Week: {user.days_per_week} | Equipment: {user.equipment}
Dietary Restrictions: {user.dietary_restrictions}
Injuries/Limitations: {user.injuries}

=== RECENT WORKOUTS (Last 10 Sessions) ===
{workouts_str if workouts_str else "No recent workouts logged."}
=== RECENT NUTRITION (Last 7 Days Average) ===
Avg Daily Calories: {avg_cal} | Protein: {avg_p}g | Carbs: {avg_c}g | Fat: {avg_f}g
Recent Meals:
{meals_str if meals_str else "  No recent meals logged."}
=== ACTIVE PLAN ===
{plan_str}"""

    return packet
