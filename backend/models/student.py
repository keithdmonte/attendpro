# backend/models/student.py
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship 
from backend.db.session import Base

from fastapi import status
from typing import List



class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=True)
    class_name = Column(String(50), nullable=True, index=True)  # e.g., "CS-A", "ME-B"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Link to attendance records for this student
    attendance_records = relationship(
    "Attendance",
    back_populates="student",
    cascade="all, delete-orphan",
    passive_deletes=True,
)
    
    # Link to messages for this student
    messages = relationship(
        "Message",
        back_populates="student",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

