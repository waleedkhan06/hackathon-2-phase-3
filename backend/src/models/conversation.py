from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Conversation(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    messages: List["Message"] = Relationship(back_populates="conversation")
    user: Optional["User"] = Relationship(back_populates="conversations")
