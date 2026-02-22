from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Models are imported by routers when needed - no need to import here for faster startup

# Import routers
from backend.app.api.routers.students import router as students_router
from backend.app.api.routers.teachers import router as teachers_router
from backend.app.api.routers.subjects import router as subjects_router
from backend.app.api.routers.attendance import router as attendance_router
from backend.app.api.routers.messages import router as messages_router
from backend.app.api.routers.semester import router as semester_router

# Create app
app = FastAPI(title="AttendPro API")

# Allowed origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://keithdmonte.github.io",  # GitHub Pages deployment
]

# Use FastAPI's built-in CORS middleware (faster and more reliable)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(students_router, prefix="/students", tags=["Students"])
app.include_router(teachers_router, prefix="/teachers", tags=["Teachers"])
app.include_router(subjects_router, prefix="/subjects", tags=["Subjects"])
app.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
app.include_router(messages_router, prefix="/messages", tags=["Messages"])
app.include_router(semester_router, prefix="/semester", tags=["Semester"])

@app.get("/")
def root(request: Request):
    # Test endpoint to check CORS headers
    return {
        "message": "AttendPro backend is running",
        "origin": request.headers.get("origin", "none")
    }
