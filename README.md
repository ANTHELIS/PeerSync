# ⚡ PeerSync — AI-Powered Peer Mentor Matching Platform

> **Hack Among Us 2026** | Track: Knowledge Navigators (Education)  
> *Connecting minds, accelerating growth*

PeerSync uses a **hybrid AI recommendation engine** (Content-Based + Collaborative Filtering) to match struggling students with the most compatible peer mentors — based on learning style, schedule, personality, and academic needs.

---

## 🏗️ Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Frontend    │────▶│    Backend    │────▶│  ML Service   │
│  React+Vite   │     │ Node+Express  │     │ Python+FastAPI│
│  Port: 5173   │     │  Port: 5000   │     │  Port: 8000   │
└───────────────┘     └───────┬───────┘     └───────────────┘
                              │
                       ┌──────▼──────┐
                       │  MongoDB    │
                       │  Database   │
                       └─────────────┘
```

---

## 📋 Prerequisites

Before starting, make sure you have:

| Tool | Version | Check |
|------|---------|-------|
| **Node.js** | v18+ | `node --version` |
| **Python** | 3.10+ | `python --version` |
| **MongoDB** | Local or Atlas | See Step 2 below |
| **npm** | v9+ | `npm --version` |
| **pip** | Latest | `pip --version` |

---

## 🚀 Setup Guide (Step by Step)

### Step 1: Clone & Open the Project

```bash
cd "d:\Works Only\VIBE PROJECTS\Hack Among Us 1"
```

---

### Step 2: Setup MongoDB

**Option A: MongoDB Atlas (Recommended — No local install needed)**

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account → Create a free M0 cluster
3. Go to **Database Access** → Add a user (username: `peersync`, password: `peersync123`)
4. Go to **Network Access** → Click "Allow Access from Anywhere"
5. Go to **Database** → Click "Connect" → "Connect your application"
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://peersync:peersync123@cluster0.xxxxx.mongodb.net/peersync?retryWrites=true&w=majority
   ```
7. Open `backend/.env` and replace the MONGO_URI:
   ```env
   MONGO_URI=mongodb+srv://peersync:peersync123@cluster0.xxxxx.mongodb.net/peersync?retryWrites=true&w=majority
   ```

**Option B: Local MongoDB**

1. Install MongoDB Community from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The default `backend/.env` already points to `mongodb://localhost:27017/peersync`

---

### Step 3: Start the Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

✅ You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
==================================================
  🚀 PeerSync Backend Server Running
  📡 Port: 5000
  🔗 URL: http://localhost:5000
  💬 WebSocket: Ready
==================================================
```

If MongoDB fails to connect, double-check your `.env` MONGO_URI.

---

### Step 4: Start the Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ You should see:
```
  VITE ready in 500ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. You can now:
1. **Sign Up** → Create an account
2. **Onboarding** → Take the learning style quiz
3. **Dashboard** → See your profile
4. **Find Mentor** → Get AI mentor matches (uses demo data if ML service is off)

---

### Step 5: Start the ML Service (Terminal 3 — Optional)

The ML service powers the **AI recommendation engine** (Content-Based + Collaborative Filtering). The app works without it (uses demo data), but for full AI-powered mentor matching you need this running.

#### 5a. Create & Activate a Virtual Environment

> **Note:** The project already has a `.venv` at the root. You can reuse it or create a fresh one inside `ml-service/`.

**Option 1 — Use the existing root `.venv`:**

```bash
# From the project root (PeerSync/)
.venv\Scripts\activate        # Windows (CMD / PowerShell)
# source .venv/bin/activate   # macOS / Linux
```

**Option 2 — Create a new venv inside ml-service:**

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
```

#### 5b. Install Dependencies

```bash
cd ml-service                  # skip if already inside
pip install -r requirements.txt
```

This installs: `fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `numpy`, `pydantic`, `joblib`, `python-dotenv`.

#### 5c. Generate Training Data

```bash
python data/generate_data.py
```

This creates synthetic mentor/student/session datasets inside `ml-service/data/` that the recommender model trains on at startup.

#### 5d. Start the Service

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Or use the included batch file (Windows):**

```bash
.\start-ml.bat          # PowerShell
start-ml.bat            # CMD
```

✅ You should see:
```
============================================================
  PeerSync ML Microservice Starting...
============================================================
  ML Engine Ready! Accepting requests.
============================================================
  INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 🔍 Verify it's Working

- **Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** `GET http://localhost:8000/api/ml/health`
- **Root Info:** `GET http://localhost:8000/`

#### ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `pip` / `python` not found | Make sure Python 3.10+ is installed and on your PATH |
| `ModuleNotFoundError` | Ensure you activated the virtual environment before `pip install` |
| Port 8000 already in use | Change the port: `--port 8001` and update `backend/.env` accordingly |
| Data files missing | Run `python data/generate_data.py` before starting the service |

---

## 📁 Project Structure

```
Hack Among Us 1/
│
├── frontend/                    # React + Vite (Port 5173)
│   ├── src/
│   │   ├── pages/               # 11 page components
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # AuthContext (JWT state)
│   │   └── services/            # API helper (Axios)
│   └── package.json
│
├── backend/                     # Node.js + Express (Port 5000)
│   ├── models/                  # Mongoose schemas (User, Session, etc.)
│   ├── controllers/             # Business logic
│   ├── routes/                  # API endpoints
│   ├── middleware/               # JWT auth, error handler
│   ├── socket/                  # Socket.IO chat handler
│   ├── server.js                # Entry point
│   └── package.json
│
├── ml-service/                  # Python + FastAPI (Port 8000)
│   ├── models/                  # Hybrid recommender engine
│   ├── utils/                   # Feature engineering, CB, CF, hybrid
│   ├── api/                     # REST endpoints
│   ├── data/                    # Data generation script
│   ├── app.py                   # Entry point
│   └── requirements.txt
│
└── .gitignore
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/students/onboarding` | Save quiz results |
| GET/PUT | `/api/students/profile` | Profile CRUD |
| PUT | `/api/students/become-mentor` | Opt-in as mentor |
| POST | `/api/matches/find` | **AI mentor matching** |
| GET | `/api/mentors` | List all mentors |
| GET | `/api/mentors/:id` | Mentor profile |
| POST | `/api/sessions/start` | Start study session |
| POST | `/api/feedback` | Submit rating |
| GET | `/api/health` | Health check |

---

## 🤖 How the AI Works

```
Student Profile                    Mentor Pool
     │                                 │
     ▼                                 ▼
┌─────────────────┐           ┌─────────────────┐
│ Feature Vector  │           │ Feature Vectors  │
│ • VARK style    │           │ • Teaching style │
│ • Subjects      │           │ • Expertise      │
│ • Schedule      │           │ • Availability   │
│ • GPA           │           │ • Patience score │
│ • Semester      │           │ • Semester       │
└────────┬────────┘           └────────┬────────┘
         │                             │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Content-Based     │ Cosine similarity on
         │   Filtering (40%)   │ style+subject+schedule
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │   Collaborative     │ SVD matrix factorization
         │   Filtering (60%)   │ on past ratings
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │   Hybrid Blend      │ α auto-tuned by
         │   + Cold-Start      │ interaction history
         └──────────┬──────────┘
                    │
                    ▼
         Top 3 Mentors with
         Match % + Reason Tags
```

---

## 👥 Team

**Team Name:** Bong Coders  
**Track:** Knowledge Navigators (Education)

---

## 📄 License

Built for **Hack Among Us 2026** at Heritage Institute of Technology.
