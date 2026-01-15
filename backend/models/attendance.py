# backend/models/attendance.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Time,
    ForeignKey,
    UniqueConstraint,
    func,
    # Enum   # ← uncomment if you switch to Enum
)
from sqlalchemy.orm import relationship
from backend.db.session import Base

# ⚡ (Optional) Enum version for stricter DB validation
# import enum
# class AttendanceStatusEnum(str, enum.Enum):
#     present = "present"
#     absent = "absent"
#     late = "late"
#     excused = "excused"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    student_id = Column(
        Integer,
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False
    )
    subject_id = Column(
        Integer,
        ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False
    )

    # Attendance date and time
    date = Column("attendance_date", Date, nullable=False)
    time = Column(Time, nullable=True)  # Time of the lecture

    # Lecture type: practical or theory
    lecture_type = Column(String(20), nullable=True)  # "practical" or "theory"

    # Attendance status (string for now; can switch to Enum above)
    status = Column(String(20), nullable=False)

    remarks = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="attendance_records")
    subject = relationship("Subject")  # no back_populates unless Subject defines it

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "subject_id",
            "attendance_date",
            "lecture_type",
            "time",
            name="uq_attendance_unique_mark",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Attendance id={self.id} student_id={self.student_id} "
            f"subject_id={self.subject_id} date={self.date} status={self.status}>"
        )
