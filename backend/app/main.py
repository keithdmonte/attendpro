from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import models (SQLAlchemy)
from backend import models

# Import routers
from backend.app.api.routers.students import router as students_router
from backend.app.api.routers.teachers import router as teachers_router
from backend.app.api.routers.subjects import router as subjects_router
from backend.app.api.routers.attendance import router as attendance_router
from backend.app.api.routers.messages import router as messages_router
from backend.app.api.routers.semester import router as semester_router

# Create app
app = FastAPI(title="AttendPro API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
def root():
    return {"message": "AttendPro backend is running"}
