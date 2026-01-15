# backend/app/api/routers/messages.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.db.session import get_db
from backend.models.message import Message
from backend.app.schemas.message import MessageCreate, MessageUpdate, MessageOut

router = APIRouter(tags=["Messages"])


@router.post("/", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def create_message(payload: MessageCreate, db: Session = Depends(get_db)):
    obj = Message(
        student_id=payload.student_id,
        sender_type=payload.sender_type,
        message=payload.message,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=List[MessageOut])
def list_messages(
    db: Session = Depends(get_db),
    student_id: Optional[int] = Query(None, ge=1),
    is_read: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    query = db.query(Message)
    
    if student_id is not None:
        query = query.filter(Message.student_id == student_id)
    if is_read is not None:
        query = query.filter(Message.is_read == is_read)
    
    offset = (page - 1) * page_size
    items = query.order_by(Message.created_at.desc()).offset(offset).limit(page_size).all()
    return items


@router.get("/{message_id}", response_model=MessageOut)
def get_message(message_id: int, db: Session = Depends(get_db)):
    obj = db.get(Message, message_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")
    return obj


@router.patch("/{message_id}", response_model=MessageOut)
def update_message(message_id: int, payload: MessageUpdate, db: Session = Depends(get_db)):
    obj = db.get(Message, message_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")

    if payload.is_read is not None:
        obj.is_read = payload.is_read

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, db: Session = Depends(get_db)):
    obj = db.get(Message, message_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")
    db.delete(obj)
    db.commit()
    return


class BulkMessageCreate(BaseModel):
    student_ids: List[int]
    message: str
    sender_type: str = "admin"


@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def create_bulk_messages(
    payload: BulkMessageCreate,
    db: Session = Depends(get_db),
):
    """Send the same message to multiple students"""
    created = []
    for student_id in payload.student_ids:
        obj = Message(
            student_id=student_id,
            sender_type=payload.sender_type,
            message=payload.message,
        )
        db.add(obj)
        created.append(obj)
    
    db.commit()
    for obj in created:
        db.refresh(obj)
    
    return {
        "created": len(created),
        "messages": [MessageOut.model_validate(obj) for obj in created]
    }

