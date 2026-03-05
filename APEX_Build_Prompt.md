# APEX — AI Fitness & Nutrition Coach
## Master Build Prompt for AI Coding Agents

---

## Project Overview

Build **APEX**, a personal AI fitness coach and nutritionist web application. This is a full-stack project for personal use. The AI agent knows the user's full history, stats, and preferences across every session and uses that context to give personalized, intelligent coaching responses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Frontend State | Zustand |
| HTTP Client | Axios |
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy |
| Database | SQLite (local file `apex.db`) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Charts | Recharts |

---

## Project Structure

Build the project exactly with this folder structure:

```
apex/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   ├── profile.py
│   │   ├── workouts.py
│   │   ├── meals.py
│   │   └── plans.py
│   └── services/
│       ├── __init__.py
│       ├── ai.py
│       └── context.py
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js
│       ├── store/
│       │   └── useAppStore.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Sidebar.jsx
│       │   └── StatCard.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Chat.jsx
│           ├── Logger.jsx
│           └── Plans.jsx
│
└── README.md
```

---

## Database Schema

Define all models in `backend/models.py` using SQLAlchemy. Create these exact tables:

### `users` table
Single row representing the logged-in user's persistent profile.

| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| name | String | |
| age | Integer | |
| gender | String | male / female / other |
| height_cm | Float | |
| weight_kg | Float | |
| goal | String | e.g. "build muscle", "lose fat", "maintain" |
| fitness_level | String | beginner / intermediate / advanced |
| days_per_week | Integer | training days available |
| equipment | String | e.g. "full gym", "home", "bodyweight only" |
| dietary_restrictions | String | e.g. "none", "vegetarian", "lactose intolerant" |
| injuries | String | e.g. "none", "left knee", "lower back" |
| created_at | DateTime | auto |
| updated_at | DateTime | auto-update on save |

### `conversations` table
Stores chat history for memory persistence.

| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| role | String | "user" or "assistant" |
| content | Text | message content |
| created_at | DateTime | auto |

### `workouts` table
One row per workout session.

| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| date | Date | |
| name | String | e.g. "Push Day A" |
| notes | Text | optional |
| duration_minutes | Integer | optional |
| created_at | DateTime | auto |

### `workout_sets` table
Individual sets within a workout session.

| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| workout_id | Integer FK → workouts.id | cascade delete |
| exercise | String | |
| sets | Integer | |
| reps | Integer | or null for time-based |
| weight_kg | Float | 0 for bodyweight |
| notes | String | optional |

### `meals` table
One row per logged meal.

| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| date | Date | |
| meal_type | String | breakfast / lunch / dinner / snack |
| name | String | e.g. "Chicken rice bowl" |
| calories | Integer | |
| protein_g | Float | |
| carbs_g | Float | |
| fat_g | Float | |
| notes | Text | optional |
| created_at | DateTime | auto |

### `plans` table
AI-generated workout or nutrition plans.

| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| type | String | "workout" or "nutrition" |
| title | String | |
| content | Text | full plan as JSON string |
| is_active | Boolean | default False |
| created_at | DateTime | auto |

---

## Backend Implementation

### `backend/main.py`
- FastAPI app with CORS enabled for `http://localhost:5173`
- Include all routers with prefix `/api`
- On startup, call `create_tables()` from `database.py`
- Health check route: `GET /` returns `{"status": "APEX is running"}`

### `backend/database.py`
- SQLite database URL: `sqlite:///./apex.db`
- Standard SQLAlchemy engine, SessionLocal, Base setup
- Export `get_db` dependency and `create_tables()` function

### `backend/services/context.py`
This is the **memory engine** — the most critical file in the project.

Implement a function `build_context_packet(db)` that:
1. Fetches the user profile from the `users` table
2. Fetches the last 10 workout sessions with their sets
3. Fetches the last 7 days of meals
4. Fetches the currently active plan (if any)
5. Returns a formatted string structured like this:

```
=== USER PROFILE ===
Name: {name} | Age: {age} | Gender: {gender}
Height: {height_cm}cm | Weight: {weight_kg}kg
Goal: {goal} | Fitness Level: {fitness_level}
Training Days/Week: {days_per_week} | Equipment: {equipment}
Dietary Restrictions: {dietary_restrictions}
Injuries/Limitations: {injuries}

=== RECENT WORKOUTS (Last 10 Sessions) ===
[date] - [workout name] ([duration] min)
  Exercises: [exercise: sets x reps @ weight_kg]
  ...

=== RECENT NUTRITION (Last 7 Days Average) ===
Avg Daily Calories: {cal} | Protein: {p}g | Carbs: {c}g | Fat: {f}g
Recent Meals:
  [date] [meal_type]: [name] — {cal}kcal, P:{p}g C:{c}g F:{f}g

=== ACTIVE PLAN ===
[plan title and content, or "No active plan set"]
```

If no user profile exists, return `"No user profile set up yet."`

### `backend/services/ai.py`
Implement `get_ai_response(user_message, context_packet, conversation_history, db)`:

1. Build the system prompt by combining:
   - The APEX coach persona (see System Prompt below)
   - The context packet string
2. Build the messages array from `conversation_history` (list of `{role, content}` dicts)
3. Append the new `user_message`
4. Call Anthropic Claude API: model `claude-sonnet-4-20250514`, max_tokens `1500`
5. Save the user message and AI response to the `conversations` table
6. Return the assistant's response text

**APEX System Prompt to inject:**
```
You are APEX, an elite personal trainer and nutritionist with deep expertise in:
- Strength training, hypertrophy, powerlifting, and functional fitness
- Sports nutrition, macro tracking, meal planning, and supplementation
- Recovery, sleep, injury prevention and mobility
- Cardiovascular fitness, HIIT, and endurance training
- Body recomposition, fat loss, and muscle building protocols

You have full access to the user's profile, training history, and nutrition logs shown above.
Use this data to give highly personalized, specific advice. Reference their actual numbers,
recent sessions, and progress when relevant. Never give generic advice when you have their data.

Your personality:
- Direct, motivating, and knowledgeable — like a top-tier personal trainer who knows their client
- Science-backed but practical — give real, actionable advice with specific numbers
- Encouraging but honest — don't sugarcoat, but always be constructive
- Ask clarifying questions when needed to give better advice

Formatting:
- Use plain text with clear structure
- Use bullet points and numbered lists for plans and steps
- Bold key terms using **bold**
- When providing workout plans: always specify sets, reps, rest periods, and progression notes
- When providing nutrition advice: always include specific calorie and macro targets
- Keep responses focused — no filler text

Safety: For medical conditions, serious injuries, or health concerns, recommend consulting
a healthcare professional while still providing general helpful guidance.
```

### API Routes

**`GET /api/profile`**
Returns the user profile. If no profile exists, return `{"exists": false}`.

**`PUT /api/profile`**
Accepts full profile payload, upserts (creates if not exists, updates if exists).

**`POST /api/chat`**
Request body: `{ "message": string }`
1. Fetch last 20 messages from `conversations` table for history
2. Call `build_context_packet(db)`
3. Call `get_ai_response(...)`
4. Return `{ "response": string }`

**`GET /api/chat/history`**
Returns last 50 messages from `conversations` table ordered by `created_at`.

**`DELETE /api/chat/history`**
Deletes all rows in `conversations` table. Returns `{"cleared": true}`.

**`POST /api/workouts`**
Accepts: `{ date, name, notes, duration_minutes, sets: [{exercise, sets, reps, weight_kg, notes}] }`
Creates workout + all sets. Returns created workout with sets.

**`GET /api/workouts`**
Optional query params: `limit` (default 20), `offset` (default 0).
Returns workouts with their sets, ordered by date descending.

**`DELETE /api/workouts/{workout_id}`**
Deletes workout and cascades to sets.

**`POST /api/meals`**
Accepts: `{ date, meal_type, name, calories, protein_g, carbs_g, fat_g, notes }`
Returns created meal.

**`GET /api/meals`**
Optional query params: `limit` (default 30), `days` (filter last N days).
Returns meals ordered by date descending.

**`DELETE /api/meals/{meal_id}`**
Deletes meal.

**`GET /api/dashboard`**
Returns aggregated stats object:
```json
{
  "total_workouts": int,
  "workouts_this_week": int,
  "current_streak_days": int,
  "avg_daily_calories_7d": float,
  "avg_daily_protein_7d": float,
  "recent_workouts": [...last 5 workouts],
  "calories_last_7_days": [{ "date": "YYYY-MM-DD", "calories": int }],
  "protein_last_7_days": [{ "date": "YYYY-MM-DD", "protein": float }]
}
```

**`POST /api/plans/generate`**
Request body: `{ "type": "workout" | "nutrition", "prompt": string }`
1. Build context packet
2. Ask Claude to generate a structured plan based on the user's profile and the prompt
3. Save to `plans` table
4. Return the created plan

**`GET /api/plans`**
Returns all saved plans ordered by `created_at` descending.

**`PATCH /api/plans/{plan_id}/activate`**
Sets `is_active = True` for this plan, `False` for all others of the same type.

**`DELETE /api/plans/{plan_id}`**
Deletes plan.

---

## Frontend Implementation

### Routing (App.jsx)
Use React Router v6. Routes:
- `/` → Dashboard
- `/chat` → Chat
- `/log` → Logger
- `/plans` → Plans

Wrap all routes in a `Layout` component that renders a persistent sidebar + main content area.

### Sidebar (components/Sidebar.jsx)
Left sidebar with:
- APEX logo at top
- Navigation links: Dashboard, Coach (chat), Log, Plans
- At the bottom: user's name and goal (fetched from profile)
- Active link highlighted

### Dashboard Page (`/`)

Display:
1. **Stats row** — 4 cards: Total Workouts, This Week, Current Streak, Avg Daily Calories (7d)
2. **Charts row** — Two line charts side by side using Recharts:
   - Calories last 7 days
   - Protein last 7 days
3. **Recent Workouts** — last 5 sessions as a list with date, name, duration
4. **Setup prompt** — if no profile exists, show a prominent card prompting the user to set up their profile (link to `/chat`)

Fetch all data from `GET /api/dashboard`.

### Chat Page (`/chat`)

Full-page chat interface:
1. Load chat history from `GET /api/chat/history` on mount
2. Display messages in scrollable list (user messages right-aligned, AI messages left-aligned)
3. Text input at bottom with send button (Enter to send, Shift+Enter for newline)
4. Show typing indicator (animated dots) while waiting for AI response
5. Auto-scroll to bottom on new messages
6. "Clear history" button in the top-right corner
7. If no profile exists, show a banner: "Set up your profile so APEX can personalize your coaching" with a form or link

### Logger Page (`/log`)

Two-tab interface: **Workout** tab and **Meal** tab.

**Workout tab:**
- Form fields: Date (default today), Workout name, Duration (minutes), Notes
- Dynamic exercise list: user can add multiple sets. Each row has: Exercise name, Sets, Reps, Weight (kg), Notes
- "Add Exercise" button to append a new row
- Submit logs to `POST /api/workouts`
- Show last 5 logged workouts below the form

**Meal tab:**
- Form fields: Date (default today), Meal type (dropdown: breakfast/lunch/dinner/snack), Meal name, Calories, Protein (g), Carbs (g), Fat (g), Notes
- Macro totals auto-calculated and shown as the user types
- Submit logs to `POST /api/meals`
- Show today's meals below the form with daily macro totals

### Plans Page (`/plans`)

1. **Generate Plan section** at top:
   - Dropdown: "Workout Plan" or "Nutrition Plan"
   - Text input: describe what you want (e.g. "4-day push/pull split for hypertrophy")
   - Generate button → calls `POST /api/plans/generate` → shows loading state
2. **Saved Plans** list below:
   - Each plan card shows: title, type badge, date created, active/inactive badge
   - "Set Active" button, "Delete" button
   - Click to expand and read full plan content

### Zustand Store (`store/useAppStore.js`)
Manage:
- `profile` — user profile object
- `chatMessages` — array of messages
- `isLoading` — AI response loading state
- Actions: `setProfile`, `addMessage`, `setMessages`, `setLoading`

### API Client (`api/client.js`)
Axios instance with `baseURL: http://localhost:8000/api`. Export typed functions for all endpoints.

---

## Environment & Setup

### `backend/.env.example`
```
ANTHROPIC_API_KEY=your_api_key_here
```

Load with `python-dotenv`. The `ANTHROPIC_API_KEY` must be set for the AI routes to work.

### `backend/requirements.txt`
```
fastapi
uvicorn[standard]
sqlalchemy
anthropic
python-dotenv
pydantic
```

### `frontend/package.json` dependencies
```
react, react-dom, react-router-dom, axios, zustand, recharts, tailwindcss, @vitejs/plugin-react, vite
```

---

## README.md

Write a clear README with:
1. Project description
2. Prerequisites (Python 3.11+, Node 18+)
3. Setup instructions:
   - Clone repo
   - Backend: `cd backend`, create `.env` from `.env.example`, `pip install -r requirements.txt`, `uvicorn main:app --reload`
   - Frontend: `cd frontend`, `npm install`, `npm run dev`
4. Usage guide for each page
5. How to extend (adding new routes, modifying the AI prompt)

---

## Build Order

Implement in this exact order to avoid dependency issues:

1. `backend/database.py` — engine and session setup
2. `backend/models.py` — all 6 table models
3. `backend/schemas.py` — all Pydantic request/response schemas
4. `backend/main.py` — FastAPI app skeleton with CORS
5. `backend/services/context.py` — context packet builder
6. `backend/services/ai.py` — Claude API wrapper
7. `backend/routes/profile.py`
8. `backend/routes/chat.py`
9. `backend/routes/workouts.py`
10. `backend/routes/meals.py`
11. `backend/routes/plans.py`
12. `frontend/` scaffold — Vite + React + Tailwind setup
13. `frontend/src/api/client.js`
14. `frontend/src/store/useAppStore.js`
15. `frontend/src/components/` — Layout, Sidebar, StatCard
16. `frontend/src/pages/Dashboard.jsx`
17. `frontend/src/pages/Chat.jsx`
18. `frontend/src/pages/Logger.jsx`
19. `frontend/src/pages/Plans.jsx`
20. `README.md`

---

## Quality Requirements

- All backend routes must have proper error handling with meaningful HTTP status codes
- All frontend forms must have input validation before submission
- Loading states must be shown on all async operations
- The app must work correctly even if no user profile has been set up yet (graceful empty states)
- CORS must be configured so frontend (port 5173) can talk to backend (port 8000)
- Database must be auto-created on first backend startup — no manual migration step
- No API keys in frontend code — all Claude API calls go through the backend only
