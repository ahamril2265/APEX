from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routes import profile, chat, workouts, meals, plans, dashboard

app = FastAPI(title="APEX AI Fitness Coach")

# Enable CORS for the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_tables()

app.include_router(profile.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(meals.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api") # Wait, dashboard route wasn't in the list? Ah, "GET /api/dashboard" was. I might put it in profile or a new dashboard.py. Let's put it in routes/dashboard.py.

@app.get("/")
def health_check():
    return {"status": "APEX is running"}
