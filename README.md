# APEX — AI Fitness & Nutrition Coach

APEX is a personalized AI fitness coach and nutritionist web application. It tracks your full history, stats, and preferences across every session to provide highly personalized, intelligent coaching directly tailored to your body and goals.

## Features

- **Dashboard:** At-a-glance tracked metrics, workout streaks, and 7-day visualizations for calories and protein.
- **AI Coach Chat:** Chat directly with the APEX AI. The agent knows your recent workouts, meals, active plans, and user profile to give incredibly specific advice.
- **Logger:** Advanced forms to quickly track multi-set, custom workouts and detailed macro-level nutrition blocks.
- **AI Plan Generator:** Tell APEX what you want to achieve, and it will generate persistent workout routines and nutrition diets using advanced context analysis.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Zustand, Recharts, Lucide React
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, SQLite (local `apex.db`), Uvicorn
- **AI Engine:** Anthropic Claude API 

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- An active `ANTHROPIC_API_KEY`

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url> apex
cd apex
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and insert your ANTHROPIC_API_KEY

# Run the server
uvicorn main:app --reload
# The backend will be available at http://localhost:8000
# The database (`apex.db`) will auto-generate on first run.
```

### 3. Frontend Setup

```bash
# In an adjacent terminal
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
# The frontend will be available at http://localhost:5173
```

---

## Usage Guide

1. **Start at the Dashboard**: If it's your first time, you will be prompted to set up your profile.
2. **Coach (Chat)**: Introduce yourself, specify your fitness goals, height, weight, etc. The AI will save this via the Profile system if prompted, or you can supply it organically.
3. **Log Your Activity**: Use the Logger page to track your daily workout sessions and meals. The more data you provide, the smarter APEX becomes.
4. **Generate Plans**: Head over to the Plans section when you want a structured 4-week routine or meal plan. Make it active so APEX knows what you're currently working on.

---

## Extending APEX

- **Adding New Routes:** Create a new file in `backend/routes/`, mount it in `backend/main.py`, and update your frontend `api/client.js` functions.
- **Modifying the AI Prompt:** Adjust the `APEX_SYSTEM_PROMPT` inside `backend/services/ai.py` to change the AI's personality or specific domains of expertise.
