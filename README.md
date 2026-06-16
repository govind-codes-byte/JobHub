# 🚀 JobHub — Full Stack Job Portal

A production-ready job portal platform built with **FastAPI**, **React 18 + TypeScript**, **MongoDB Atlas**, and **Tailwind CSS**. Designed to resemble a real-world SaaS product like LinkedIn Jobs.

---

## 🌟 Features

### 👤 Candidate
- Register/login with JWT authentication
- Build a full profile (bio, skills, education, experience, links)
- Upload resume (PDF) and avatar
- Browse & search jobs with advanced filters
- Apply with a cover letter
- Track application status in real-time (Applied → Under Review → Shortlisted → Selected/Rejected)

### 🏢 Recruiter
- Company profile setup
- Post, edit, close/reopen jobs
- View all applicants per job
- Update application statuses with notes
- Download candidate resumes

### 🛡️ Admin
- Dashboard with live stats & charts
- Manage all users (suspend/activate/delete)
- View all jobs across the platform

---

## 🗂 Project Structure

```
JobHub/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── config/           # Database + settings
│   │   ├── middleware/        # JWT auth middleware
│   │   ├── models/           # (reserved for ODM models)
│   │   ├── routes/           # auth, users, jobs, applications, admin
│   │   ├── schemas/          # Pydantic schemas
│   │   └── utils/            # security (JWT/bcrypt), helpers
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   ├── render.yaml           # Render deployment config
│   └── .env.example
│
└── frontend/                 # React + TypeScript frontend
    ├── src/
    │   ├── api/              # Axios client + service functions
    │   ├── components/
    │   │   ├── auth/         # ProtectedRoute
    │   │   ├── jobs/         # JobCard, JobSearchBar
    │   │   ├── layout/       # Navbar, DashboardLayout, Footer
    │   │   └── ui/           # Button, Input, Modal, Skeleton, Badge...
    │   ├── context/          # AuthContext, ThemeContext (dark mode)
    │   ├── pages/
    │   │   ├── auth/         # Login, Register
    │   │   ├── candidate/    # Dashboard, Profile, Applications
    │   │   ├── recruiter/    # Dashboard, Profile, Jobs, Applicants
    │   │   └── admin/        # Dashboard, Users
    │   ├── types/            # TypeScript interfaces
    │   └── utils/            # Helpers (formatSalary, timeAgo, colors)
    ├── vercel.json
    └── .env.example
```

---

## ⚙️ Tech Stack

| Layer      | Technology                              |
|------------|----------------------------------------|
| Frontend   | React 18, TypeScript, Vite             |
| Styling    | Tailwind CSS v3, Framer Motion         |
| State      | TanStack React Query, Context API      |
| Forms      | React Hook Form + Zod validation       |
| Backend    | Python 3.11+, FastAPI, Pydantic v2     |
| Auth       | JWT (python-jose) + bcrypt (passlib)   |
| Database   | MongoDB Atlas + Motor (async driver)   |
| Deployment | Frontend → Vercel, Backend → Render    |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works)

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and a secret key

# Run development server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

App: http://localhost:5173

---

## 🌐 Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   ```
   MONGODB_URL=mongodb+srv://...
   SECRET_KEY=your-super-secret-key
   DATABASE_NAME=jobhub
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import on [vercel.com](https://vercel.com)
3. Framework: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Deploy

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Register user      |
| POST   | /api/auth/login       | Login, get token   |
| GET    | /api/auth/me          | Current user info  |

### Users
| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| GET    | /api/users/profile            | Get own profile        |
| PUT    | /api/users/profile            | Update profile         |
| POST   | /api/users/resume             | Upload resume PDF      |
| POST   | /api/users/avatar             | Upload avatar image    |
| GET    | /api/users/                   | List all (admin)       |
| DELETE | /api/users/{id}               | Delete user (admin)    |

### Jobs
| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| GET    | /api/jobs              | Search/filter jobs      |
| POST   | /api/jobs              | Create job (recruiter)  |
| GET    | /api/jobs/featured     | 6 latest jobs           |
| GET    | /api/jobs/my-jobs      | Recruiter's own jobs    |
| GET    | /api/jobs/{id}         | Job detail              |
| PUT    | /api/jobs/{id}         | Update job              |
| DELETE | /api/jobs/{id}         | Delete job              |

### Applications
| Method | Endpoint                            | Description              |
|--------|-------------------------------------|--------------------------|
| POST   | /api/applications                   | Apply for a job          |
| GET    | /api/applications/my-applications   | Candidate's applications |
| GET    | /api/applications/job/{jobId}       | Job applicants           |
| PUT    | /api/applications/{id}/status       | Update status            |

### Admin
| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| GET    | /api/admin/stats | Platform stats    |

---

## 🔐 Environment Variables

### Backend `.env`
```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/jobhub
DATABASE_NAME=jobhub
SECRET_KEY=your-minimum-32-character-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## 🎨 UI Highlights

- **Dark Mode** — System-aware with manual toggle
- **Responsive** — Mobile-first, works on all screen sizes
- **Animations** — Smooth transitions with Framer Motion
- **Skeletons** — Loading placeholders for every data state
- **Toast Notifications** — Success/error feedback
- **Role-based Routing** — Automatic redirect by user role

---

## 📦 Seed Demo Data

After starting the backend, create demo users via the API:

```bash
# Create candidate
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Candidate","email":"candidate@demo.com","password":"password123","role":"candidate"}'

# Create recruiter
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Recruiter","email":"recruiter@demo.com","password":"password123","role":"recruiter"}'

# Create admin
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@demo.com","password":"password123","role":"admin"}'
```

---

## 👨‍💻 Built By

**Govind Kumar** — Full Stack Developer (MERN & Python/FastAPI)

> This project demonstrates production-level code quality, clean architecture, JWT security, async MongoDB operations, and modern React patterns — suitable for Python Developer, FastAPI Developer, and Full Stack Developer roles.
