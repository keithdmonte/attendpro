from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from fastapi import status
from typing import List


# Shared fields between create/read
class StudentBase(BaseModel):
    roll_no: str = Field(..., min_length=1, max_length=50)
    name: str
    email: EmailStr
    class_name: Optional[str] = Field(None, max_length=50)

# For POST /students
class StudentCreate(StudentBase):
    pass

# For PATCH/PUT /students/{id}
class StudentUpdate(BaseModel):
    roll_no: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    class_name: Optional[str] = None

# For responses
class StudentOut(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: allow ORM -> schema conversion
