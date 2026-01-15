# backend/models/admin.py
from sqlalchemy import Column, Integer, String, DateTime, func
from backend.db.session import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # Hashed password
    name = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Admin id={self.id} email={self.email} name={self.name}>"

