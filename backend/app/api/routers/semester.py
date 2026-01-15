# backend/app/api/routers/semester.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import hashlib

from backend.db.session import get_db
from backend.models.semester_archive import SemesterArchive
from backend.models.student import Student
from backend.models.subject import Subject
from backend.models.attendance import Attendance
from backend.models.message import Message
from backend.models.admin import Admin
from backend.app.schemas.semester import SemesterArchiveCreate, SemesterArchiveOut
from backend.app.schemas.admin import AdminVerifyPassword

router = APIRouter(tags=["Semester"])


def _hash_password(password: str) -> str:
    """Simple password hashing (SHA256)"""
    return hashlib.sha256(password.encode()).hexdigest()


def _verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return _hash_password(password) == hashed


@router.post("/verify-password", status_code=status.HTTP_200_OK)
def verify_admin_password(payload: AdminVerifyPassword, db: Session = Depends(get_db)):
    """Verify admin password before ending semester"""
    # Get the first admin (or create default if none exists)
    admin = db.query(Admin).first()
    
    if not admin:
        # Create default admin with password "admin123" (for initial setup)
        # In production, this should be set up properly
        default_password = _hash_password("admin123")
        admin = Admin(
            email="admin@attendpro.com",
            password=default_password,
            name="System Administrator"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    
    if not _verify_password(payload.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Access denied."
        )
    
    return {"verified": True, "message": "Password verified successfully"}


@router.post("/end", response_model=SemesterArchiveOut, status_code=status.HTTP_201_CREATED)
def end_semester(payload: SemesterArchiveCreate, db: Session = Depends(get_db)):
    """
    End current semester:
    1. Verify admin password
    2. Archive statistics
    3. Delete all students, subjects, attendance records, and messages
    4. Keep teachers (they persist across semesters)
    """
    # Verify password first
    admin = db.query(Admin).first()
    if not admin:
        # Create default admin with password "admin123" (for initial setup)
        default_password = _hash_password("admin123")
        admin = Admin(
            email="admin@attendpro.com",
            password=default_password,
            name="System Administrator"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    
    if not _verify_password(payload.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Cannot end semester."
        )
    
    try:
        # Count current data
        total_students = db.query(func.count(Student.id)).scalar() or 0
        total_subjects = db.query(func.count(Subject.id)).scalar() or 0
        total_attendance = db.query(func.count(Attendance.id)).scalar() or 0
        total_messages = db.query(func.count(Message.id)).scalar() or 0

        # Create archive record
        archive = SemesterArchive(
            semester_name=payload.semester_name,
            total_students=total_students,
            total_subjects=total_subjects,
            total_attendance_records=total_attendance,
            total_messages=total_messages,
            archive_metadata={
                "archived_by": "admin",  # Could be enhanced with actual user info
            }
        )
        db.add(archive)
        db.flush()  # Get the archive ID

        # Delete all messages (cascade will handle student references)
        db.query(Message).delete()
        
        # Delete all attendance records (cascade will handle student/subject references)
        db.query(Attendance).delete()
        
        # Delete all subjects (cascade will handle teacher references)
        db.query(Subject).delete()
        
        # Delete all students (cascade will handle attendance and messages)
        db.query(Student).delete()

        # Commit all changes
        db.commit()
        db.refresh(archive)

        return archive

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ending semester: {str(e)}"
        ) from e


@router.get("/history", response_model=List[SemesterArchiveOut])
def get_semester_history(db: Session = Depends(get_db)):
    """Get all archived semesters"""
    archives = db.query(SemesterArchive).order_by(SemesterArchive.archived_at.desc()).all()
    return archives


@router.get("/history/{archive_id}", response_model=SemesterArchiveOut)
def get_semester_archive(archive_id: int, db: Session = Depends(get_db)):
    """Get a specific archived semester"""
    archive = db.get(SemesterArchive, archive_id)
    if not archive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Semester archive not found"
        )
    return archive


@router.delete("/history/{archive_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_semester_archive(
    archive_id: int,
    password: str = Query(..., description="Admin password for verification"),
    db: Session = Depends(get_db)
):
    """
    Delete a semester archive permanently.
    Requires admin password verification.
    Password should be passed as a query parameter.
    """
    # Verify password first
    admin = db.query(Admin).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found. Cannot delete archive."
        )
    
    if not _verify_password(password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Cannot delete archive."
        )
    
    # Get the archive
    archive = db.get(SemesterArchive, archive_id)
    if not archive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Semester archive not found"
        )
    
    try:
        # Delete the archive
        db.delete(archive)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting archive: {str(e)}"
        ) from e

