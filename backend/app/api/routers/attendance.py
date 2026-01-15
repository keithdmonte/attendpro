# backend/app/api/routers/attendance.py
from datetime import date
from typing import List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.models.attendance import Attendance
from backend.app.schemas.attendance import (
    AttendanceCreate,
    AttendanceOut,
    AttendanceUpdateStatus,
    AttendanceStatusLiteral,
    BulkAttendanceCreate,
    BulkAttendanceResult,
)

router = APIRouter(tags=["Attendance"])


def _paginate(query, page: int, page_size: int) -> Tuple:
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size), offset


# ✅ Create single attendance
@router.post("/", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    try:
        obj = Attendance(
            student_id=payload.student_id,
            subject_id=payload.subject_id,
            date=payload.date,
            time=payload.time,
            lecture_type=payload.lecture_type,
            status=payload.status,
            remarks=payload.remarks,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already exists for this student, subject, and date.",
        ) from e


# ✅ List attendance (with filters)
@router.get("/", response_model=List[AttendanceOut])
def list_attendance(
    db: Session = Depends(get_db),
    student_id: Optional[int] = Query(None, ge=1),
    subject_id: Optional[int] = Query(None, ge=1),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    status_: Optional[AttendanceStatusLiteral] = Query(None, alias="status"),
    lecture_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    order: str = Query("desc", pattern="^(asc|desc)$"),
):
    stmt = select(Attendance)
    conditions = []

    if student_id is not None:
        conditions.append(Attendance.student_id == student_id)
    if subject_id is not None:
        conditions.append(Attendance.subject_id == subject_id)
    if status_ is not None:
        conditions.append(Attendance.status == status_)
    if lecture_type is not None:
        conditions.append(Attendance.lecture_type == lecture_type)
    if date_from is not None:
        conditions.append(Attendance.date >= date_from)
    if date_to is not None:
        conditions.append(Attendance.date <= date_to)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    if order == "asc":
        stmt = stmt.order_by(Attendance.date.asc(), Attendance.id.asc())
    else:
        stmt = stmt.order_by(Attendance.date.desc(), Attendance.id.desc())

    stmt, _ = _paginate(stmt, page, page_size)
    return db.execute(stmt).scalars().all()


# ✅ Get single attendance by ID
@router.get("/{attendance_id}", response_model=AttendanceOut)
def get_attendance(attendance_id: int, db: Session = Depends(get_db)):
    obj = db.get(Attendance, attendance_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found.")
    return obj


# ✅ Update attendance status or remarks
@router.patch("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(attendance_id: int, payload: AttendanceUpdateStatus, db: Session = Depends(get_db)):
    obj = db.get(Attendance, attendance_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found.")

    if payload.status is not None:
        obj.status = payload.status
    if payload.remarks is not None:
        obj.remarks = payload.remarks

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# ✅ Delete attendance
@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    obj = db.get(Attendance, attendance_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance not found.")
    db.delete(obj)
    db.commit()
    return


# ✅ Bulk create attendance
@router.post("/bulk", response_model=BulkAttendanceResult, status_code=status.HTTP_200_OK)
def create_attendance_bulk(
    payload: BulkAttendanceCreate,
    skip_duplicates: bool = Query(
        True, description="If true, duplicate rows are skipped; otherwise whole batch errors."
    ),
    db: Session = Depends(get_db),
):
    created_items = []
    skipped = 0

    for rec in payload.records:
        try:
            with db.begin_nested():  # savepoint for each record
                obj = Attendance(
                    student_id=rec.student_id,
                    subject_id=payload.subject_id,
                    date=payload.date,
                    time=payload.time,
                    lecture_type=payload.lecture_type,
                    status=rec.status,
                    remarks=rec.remarks,
                )
                db.add(obj)
                db.flush()
                db.refresh(obj)
                created_items.append(obj)
        except IntegrityError as e:
            if skip_duplicates:
                skipped += 1
                continue
            else:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Duplicate attendance found in batch (student_id, subject_id, date)."
                ) from e

    db.commit()
    
    # Return all created items (they all have time and lecture_type since we're creating them)
    return BulkAttendanceResult(
        created=len(created_items),
        skipped=skipped,
        items=created_items,
    )
