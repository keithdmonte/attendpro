# backend/app/schemas/attendance.py
from datetime import date, datetime, time as dt_time
from typing import Optional, Literal, List, Union
from pydantic import BaseModel, Field

AttendanceStatusLiteral = Literal["present", "absent", "late", "excused"]
LectureTypeLiteral = Literal["practical", "theory"]

class AttendanceBase(BaseModel):
    student_id: int = Field(..., ge=1)
    subject_id: int = Field(..., ge=1)
    date: date
    time: Optional[dt_time] = None
    lecture_type: Optional[LectureTypeLiteral] = None
    status: AttendanceStatusLiteral
    remarks: Optional[str] = Field(None, max_length=255)

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdateStatus(BaseModel):
    status: Optional[AttendanceStatusLiteral] = None
    remarks: Optional[str] = Field(None, max_length=255)

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    date: date
    time: Union[dt_time, None] = None  # Optional to handle existing NULL records
    lecture_type: Union[str, None] = None  # Optional to handle existing NULL records
    status: AttendanceStatusLiteral
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceFilter(BaseModel):
    student_id: Optional[int] = Field(None, ge=1)
    subject_id: Optional[int] = Field(None, ge=1)
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    status: Optional[AttendanceStatusLiteral] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=200)
    order: Literal["asc", "desc"] = "desc"


class BulkRecord(BaseModel):
    student_id: int = Field(..., ge=1)
    status: AttendanceStatusLiteral
    remarks: Optional[str] = Field(None, max_length=255)

class BulkAttendanceCreate(BaseModel):
    subject_id: int = Field(..., ge=1)
    date: date
    time: dt_time  # Required field
    lecture_type: LectureTypeLiteral  # Required field
    records: List[BulkRecord] = Field(..., min_items=1)

class BulkAttendanceResult(BaseModel):
    created: int
    skipped: int
    items: List[AttendanceOut]