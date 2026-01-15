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
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up database
# Update backend/app/core/config.py with your database URL

# Run migrations
alembic upgrade head

# Start backend server
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup

```bash
cd attendpro-frontend
npm install
npm run dev
```

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

## 📝 License

MIT License

## 👥 Contributors

- Your Name Here

## 🔗 Links

- [Live Demo](https://yourusername.github.io/attendpro/)
- [Backend API](https://your-backend-url.com/docs)
