from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    email: str = Field(sa_column_kwargs={"unique": True}, nullable=False)
    name: Optional[str] = Field(default=None, max_length=255)  # Add name field
    password: str = Field(nullable=False)  # Add password field
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversations: List["Conversation"] = Relationship(back_populates="user")
    tasks: List["Task"] = Relationship(back_populates="user")