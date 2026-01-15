# models/teacher.py
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from backend.db.session import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    # DB-side timestamp with timezone (consistent with other models)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=True)

    # Keep this ONLY if subjects.teacher_id exists as a real FK
    # and Subject defines: teacher = relationship("Teacher", back_populates="subjects")
    # subjects = relationship(
    #     "Subject",
    #     back_populates="teacher",
    #     cascade="all, delete-orphan"
    # )

