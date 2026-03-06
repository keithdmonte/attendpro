from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from backend.models.teacher import Teacher
from backend.app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherOut
from backend.db.session import get_db

router = APIRouter(tags=["Teachers"])


def _paginate(stmt, page: int, page_size: int) -> Tuple:
    offset = (page - 1) * page_size
    return stmt.offset(offset).limit(page_size), offset


@router.post("/", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
def create_teacher(payload: TeacherCreate, db: Session = Depends(get_db)):
    obj = Teacher(
        name=payload.name,
        email=payload.email,
        department=payload.department,
    )
    db.add(obj)
    try:
        db.commit()
        db.refresh(obj)
        return obj
    except IntegrityError as e:
        db.rollback()
        err_msg = str(getattr(e, "orig", e))
        # Check if it's a unique constraint violation (duplicate email)
        if "unique" in err_msg.lower() or "duplicate" in err_msg.lower() or "already exists" in err_msg.lower():
            detail = "A teacher with this email already exists."
        else:
            detail = f"Database error: {err_msg}"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        ) from e


@router.get("/", response_model=List[TeacherOut])
def list_teachers(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Free-text search in name/email/department"),
    name: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    order: str = Query("desc", pattern="^(asc|desc)$"),
):
    stmt = select(Teacher)
    conds = []

    if q:
        like = f"%{q.lower()}%"
        conds.append(
            func.lower(Teacher.name).like(like) |
            func.lower(Teacher.email).like(like) |
            func.lower(Teacher.department).like(like)
        )

    if name:
        conds.append(func.lower(Teacher.name) == name.lower())
    if email:
        conds.append(func.lower(Teacher.email) == email.lower())
    if department:
        conds.append(func.lower(Teacher.department) == department.lower())

    if conds:
        stmt = stmt.where(and_(*conds))

    if order == "asc":
        stmt = stmt.order_by(Teacher.id.asc())
    else:
        stmt = stmt.order_by(Teacher.id.desc())

    stmt, _ = _paginate(stmt, page, page_size)
    return db.execute(stmt).scalars().all()


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    obj = db.get(Teacher, teacher_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found.")
    return obj


@router.patch("/{teacher_id}", response_model=TeacherOut)
def update_teacher(teacher_id: int, payload: TeacherUpdate, db: Session = Depends(get_db)):
    obj = db.get(Teacher, teacher_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found.")

    if payload.name is not None:
        obj.name = payload.name
    if payload.email is not None:
        obj.email = payload.email
    if payload.department is not None:
        obj.department = payload.department

    try:
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already in use by another teacher."
        ) from e


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    obj = db.get(Teacher, teacher_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found.")
    db.delete(obj)
    db.commit()
    return
