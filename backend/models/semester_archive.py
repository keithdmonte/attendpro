# backend/models/semester_archive.py
from sqlalchemy import Column, Integer, String, DateTime, func, JSON
from backend.db.session import Base


class SemesterArchive(Base):
    __tablename__ = "semester_archives"

    id = Column(Integer, primary_key=True, index=True)
    semester_name = Column(String(100), nullable=False)  # e.g., "Fall 2024", "Spring 2025"
    archived_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Archive statistics
    total_students = Column(Integer, nullable=False, default=0)
    total_subjects = Column(Integer, nullable=False, default=0)
    total_attendance_records = Column(Integer, nullable=False, default=0)
    total_messages = Column(Integer, nullable=False, default=0)
    
    # Archive metadata (optional JSON for additional info)
    archive_metadata = Column("metadata", JSON, nullable=True)  # Column name is "metadata" in DB, but attribute is "archive_metadata"

    def __repr__(self) -> str:
        return f"<SemesterArchive id={self.id} semester_name={self.semester_name} archived_at={self.archived_at}>"

