# ORBITA — Intellectual Frontier
## MVP v1.0

> Intelligence is the only resource that compounds without geography.
> We identify it. Quantify it. Turn it into an asset.

---

## System Architecture

```
┌─────────────┐     HTTP      ┌──────────────────┐     SQLite
│  Website    │ ──────────── ▶│  FastAPI Backend  │ ──────────▶ orbita.db
│  (HTML/JS)  │               │  (single source   │
└─────────────┘               │   of truth)       │
                               └──────────────────┘
┌─────────────┐     HTTP             ▲
│  Telegram   │ ────────────────────┘
│  Bot        │  (no business logic)
└─────────────┘
```

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Open the Website

```bash
# Option A: simple python server (recommended)
cd web
python -m http.server 3000

# Then open: http://localhost:3000
```

The database (`orbita.db`) is auto-created with seeded quests on first run.

### 4. Start the Telegram Bot (optional)

```bash
# Set your bot token (get one from @BotFather on Telegram)
export BOT_TOKEN="your_token_here"

# Optionally set a remote backend URL
export API_BASE="http://localhost:8000"   # default

cd bot
python bot.py
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create or get user |
| GET | `/user/{id}` | Get user data |
| GET | `/quests` | List all quests |
| POST | `/submit` | Submit quest answer |
| GET | `/profile/{user_id}` | Get profile + level |

### Register
```json
POST /register
{ "username": "string", "source": "web" }
→ { "user_id": 1, "balance": 0 }
```

### Submit Answer
```json
POST /submit
{ "user_id": 1, "quest_id": 1, "answer": "string" }
→ { "correct": true, "score": 100, "reward": 500, "new_balance": 500 }
```

---

## Quest Details

### Quest 1 — Three Switches (Logic)
**Problem:** 3 switches, 3 bulbs, enter room once. How do you determine which switch controls which bulb?

**Valid answers** must include keywords: `heat`, `warm`, `temperature`, `hot`, `turn on`, `wait`, `left on`

**Hint:** Turn one switch on for a few minutes, turn it off, turn another on, enter room — feel the bulbs.

### Quest 2 — Precision Target
**Problem:** Value of π to 5 decimal places.

**Exact answer:** `3.14159`

---

## Level System

| Balance | Level |
|---------|-------|
| 0 | Unranked |
| 1 – 999 | Beginner |
| 1000 – 2999 | Analyst |
| 3000 – 6999 | Strategist |
| 7000+ | Oracle |

---

## Project Structure

```
orbita/
├── backend/
│   ├── main.py          # FastAPI app, all routes, validation logic
│   ├── models.py        # SQLAlchemy models
│   └── database.py      # DB engine + session
├── web/
│   ├── index.html       # Landing page (manifesto, agents, investors, register)
│   ├── dashboard.html   # Quest dashboard
│   ├── styles.css       # Dark theme styles
│   └── app.js           # API helpers + registration
├── bot/
│   └── bot.py           # Telegram bot (API client only)
├── requirements.txt
└── README.md
```

---

## Deploying to Production

1. **Backend**: Deploy to Railway, Render, or any VPS. Set `--host 0.0.0.0`.
2. **Frontend**: Update `API_BASE` in `web/app.js` to your backend URL.
3. **Bot**: Set `BOT_TOKEN` and `API_BASE` env vars. Run on same VPS or separately.
4. **Database**: Migrate from SQLite → PostgreSQL for production (change `DATABASE_URL`).

---


