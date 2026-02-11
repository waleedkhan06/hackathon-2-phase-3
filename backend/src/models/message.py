from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Message(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_uuid, primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id", nullable=False)
    user_id: str = Field(foreign_key="user.id", nullable=False) # Explicit link for data integrity/queries
    role: str # "user" or "assistant"
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Optional[List["Conversation"]] = Relationship(back_populates="messages")
