from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class TeacherBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None


class TeacherOut(TeacherBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
