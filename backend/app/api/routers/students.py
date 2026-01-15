# backend/app/api/routers/students.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.models.student import Student
from backend.app.schemas.student import StudentCreate, StudentUpdate, StudentOut
from backend.db.session import get_db



router = APIRouter(tags=["students"])


@router.get("/ping")
def ping_students():
    return {"message": "Students router is working!"}


@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    # Optional: enforce uniqueness on roll_no or email
    # existing = db.query(Student).filter(
    #     (Student.roll_no == payload.roll_no) | (Student.email == payload.email)
    # ).first()
    # if existing:
    #     raise HTTPException(status_code=400, detail="Student with same roll_no or email already exists")

    obj = Student(
        roll_no=payload.roll_no,
        name=payload.name,
        email=payload.email,
        class_name=payload.class_name,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=List[StudentOut])
def list_students(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    class_name: Optional[str] = None,
):
    query = db.query(Student)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(like))
            | (Student.roll_no.ilike(like))
            | (Student.email.ilike(like))
        )
    if class_name:
        query = query.filter(Student.class_name == class_name)
    items = query.order_by(Student.id.desc()).offset(skip).limit(limit).all()
    return items


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    obj = db.get(Student, student_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    return obj


@router.patch("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, payload: StudentUpdate, db: Session = Depends(get_db)):
    obj = db.get(Student, student_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    obj = db.get(Student, student_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(obj)
    db.commit()
    return None


# ✅ Get all unique classes from students
@router.get("/classes/list", response_model=List[str])
def list_classes(db: Session = Depends(get_db)):
    """Get all unique class names from students"""
    classes = db.query(Student.class_name).distinct().filter(
        Student.class_name.isnot(None),
        Student.class_name != ""
    ).all()
    return [cls[0] for cls in classes if cls[0]]
