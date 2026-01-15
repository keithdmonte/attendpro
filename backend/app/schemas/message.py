# backend/app/schemas/message.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    student_id: int = Field(..., ge=1)
    sender_type: str = Field(default="admin", pattern="^(admin|teacher)$")
    message: str = Field(..., min_length=1, max_length=500)


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    is_read: Optional[bool] = None


class MessageOut(BaseModel):
    id: int
    student_id: int
    sender_type: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

