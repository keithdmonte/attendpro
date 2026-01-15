# backend/app/schemas/semester.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class SemesterArchiveCreate(BaseModel):
    semester_name: str
    password: str  # Admin password required


class SemesterArchiveOut(BaseModel):
    id: int
    semester_name: str
    archived_at: datetime
    total_students: int
    total_subjects: int
    total_attendance_records: int
    total_messages: int
    archive_metadata: Optional[dict] = None

    class Config:
        from_attributes = True

