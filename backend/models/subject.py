# backend/models/subject.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.db.session import Base



class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), index=True, nullable=False)  # Removed unique=True, now unique with class_name
    class_name = Column(String(50), nullable=True, index=True)  # Class this subject is for (e.g., "FYCO1", "SYCO1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to teacher
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    teacher = relationship("Teacher")

    # Unique constraint: same subject code can exist for different classes
    __table_args__ = (
        UniqueConstraint('code', 'class_name', name='uq_subject_code_class'),
    )


    # Relationship to attendance
    # attendances = relationship(
    #     "Attendance",
    #     back_populates="subject",
    #     cascade="all, delete-orphan"
    # )


