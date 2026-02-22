# AttendPro - Attendance Management System

A modern, responsive attendance management system built with React and FastAPI, featuring a Duolingo-inspired UI.

## 🚀 Features

- **Admin Panel**: Complete system management for Head of Department
  - Student, Teacher, and Subject management
  - Attendance tracking and analytics
  - Low attendance alerts
  - Semester archiving and reset
  - Teacher assignment to subjects

- **Teacher Dashboard**: Easy attendance marking
  - Quick attendance marking with toggle buttons
  - View attendance records
  - Subject and class filtering

- **Student Portal**: View attendance and messages
  - Personal attendance dashboard
  - Subject-wise attendance tracking
  - Message notifications from admin/teachers

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Bootstrap 5
- Axios
- React Router

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic (Database Migrations)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL

### Backend Setup

```bash
# Navigate to project root
cd /path/to/attendpro

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Set up database
# Update backend/app/core/config.py with your database URL

# Run migrations
cd backend
alembic upgrade head
cd ..
```

### Frontend Setup

```bash
cd attendpro-frontend
npm install
```

## 🚀 How to Run the System

### Start Backend Server

**Important:** Run from the **project root** directory, not from the `backend` directory.

```bash
# Navigate to project root
cd /path/to/attendpro

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Start backend server
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at: `http://127.0.0.1:8000`
API documentation: `http://127.0.0.1:8000/docs`

### Start Frontend Server

Open a **new terminal window** and run:

```bash
cd attendpro-frontend
npm run dev
```

The frontend will be available at: `http://127.0.0.1:5173`

### Quick Start Commands

**Terminal 1 - Backend:**
```bash
cd /path/to/attendpro && source .venv/bin/activate && uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /path/to/attendpro/attendpro-frontend && npm run dev
```

> **Note:** Both servers need to run simultaneously. Keep both terminal windows open.

## 🌐 Deployment

### GitHub Pages

The frontend is configured for GitHub Pages deployment:

1. Push code to GitHub
2. Go to repository Settings > Pages
3. Select source: "GitHub Actions"
4. The workflow will automatically deploy on push to `main` branch

**Note**: Update `VITE_API_URL` environment variable in GitHub Actions secrets if your backend is hosted elsewhere.

### Environment Variables

Create `.env` file in `attendpro-frontend/`:

```env
VITE_API_URL=https://your-backend-api-url.com
```

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## 🎨 UI Theme

Inspired by Duolingo's fun and engaging color palette:
- Green primary colors
- Rounded corners
- Smooth animations
- Modern card-based layouts

## 🔧 Troubleshooting

### Port Already in Use (Backend)

If you get `ERROR: [Errno 48] Address already in use`:

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8001
```

### Module Not Found Error

If you get `ModuleNotFoundError: No module named 'backend'`:

- Make sure you're running uvicorn from the **project root**, not from the `backend` directory
- The correct command is: `uvicorn backend.app.main:app` (from project root)
- The incorrect command is: `uvicorn app.main:app` (from backend directory)

### Frontend Can't Connect to Backend

- Ensure backend is running on `http://127.0.0.1:8000`
- Check browser console for CORS errors
- Verify backend CORS settings in `backend/app/main.py` include your frontend URL

## 📝 License

MIT License

## 👥 Contributors

- Your Name Here

## 🔗 Links

- [Live Demo](https://yourusername.github.io/attendpro/)
- [Backend API](https://your-backend-url.com/docs)
