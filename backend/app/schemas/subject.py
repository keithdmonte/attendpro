from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Shared fields
class SubjectBase(BaseModel):
    name: str
    code: str
    teacher_id: int
    class_name: Optional[str] = None

# For creating a subject
class SubjectCreate(SubjectBase):
    pass

# For updating a subject (all fields optional)
class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    teacher_id: Optional[int] = None
    class_name: Optional[str] = None

# For responses
class SubjectOut(SubjectBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Pydantic v2: ORM mode
