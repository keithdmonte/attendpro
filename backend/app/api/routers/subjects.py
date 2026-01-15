from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session

from backend.models.subject import Subject
from backend.app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectOut

from backend.db.session import get_db


router = APIRouter(tags=["Subjects"])

@router.get("/ping")
def ping_subjects():
    return {"message": "Subjects router is working!"}


@router.post("/", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    # Check if same subject code + class_name combination already exists
    exists = db.query(Subject).filter(
        Subject.code == payload.code,
        Subject.class_name == payload.class_name
    ).first()
    if exists:
        raise HTTPException(
            status_code=400, 
            detail=f"Subject with code '{payload.code}' already exists for class '{payload.class_name}'"
        )

    obj = Subject(
        name=payload.name,
        code=payload.code,
        teacher_id=payload.teacher_id,
        class_name=payload.class_name,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    # Ensure created_at is set
    if obj.created_at is None:
        from datetime import datetime, timezone
        obj.created_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=List[SubjectOut])
def list_subjects(
    db: Session = Depends(get_db),
    class_name: Optional[str] = Query(None),
    teacher_id: Optional[int] = Query(None, ge=1),
):
    query = db.query(Subject)
    if class_name:
        query = query.filter(Subject.class_name == class_name)
    if teacher_id:
        query = query.filter(Subject.teacher_id == teacher_id)
    subjects = query.order_by(Subject.id.desc()).all()
    # Ensure created_at is set for any subjects that might have None
    from datetime import datetime, timezone
    for subject in subjects:
        if subject.created_at is None:
            subject.created_at = datetime.now(timezone.utc)
            db.add(subject)
    db.commit()
    return subjects


@router.get("/{subject_id}", response_model=SubjectOut)
def get_subject(
    subject_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    obj = db.get(Subject, subject_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return obj


@router.patch("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
):
    obj = db.get(Subject, subject_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subject not found")

    data = payload.model_dump(exclude_unset=True)

    # Check uniqueness when code or class_name is being changed
    if "code" in data or "class_name" in data:
        code_to_check = data.get("code", obj.code)
        class_to_check = data.get("class_name", obj.class_name)
        exists = db.query(Subject).filter(
            Subject.code == code_to_check,
            Subject.class_name == class_to_check,
            Subject.id != subject_id
        ).first()
        if exists:
            raise HTTPException(
                status_code=400, 
                detail=f"Subject with code '{code_to_check}' already exists for class '{class_to_check}'"
            )

    for k, v in data.items():
        setattr(obj, k, v)

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    obj = db.get(Subject, subject_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(obj)
    db.commit()
    return None