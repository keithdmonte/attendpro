# backend/app/schemas/admin.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class AdminVerifyPassword(BaseModel):
    password: str


class AdminOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

