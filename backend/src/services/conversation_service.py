from sqlmodel import Session, select
from src.services.database import get_session
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.user import User
from typing import Optional

def create_conversation(session: Session, user_id: str) -> Conversation:
    """Creates a new conversation for the given user."""
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation

def get_or_create_conversation(session: Session, user_id: str, thread_id: Optional[str] = None) -> Conversation:
    """
    Retrieves an existing conversation or creates a new one.
    If thread_id is provided, it attempts to find that conversation.
    Otherwise, it creates a new one.
    """
    if thread_id:
        conversation = session.exec(select(Conversation).where(
            Conversation.id == thread_id,
            Conversation.user_id == user_id
        )).first()
        if conversation:
            return conversation
    
    # If no thread_id or not found, create a new conversation
    return create_conversation(session, user_id)

def add_message_to_conversation(
    session: Session,
    conversation_id: str,
    user_id: str,
    role: str, # "user" or "assistant"
    content: str
) -> Message:
    """Adds a new message to an existing conversation."""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message

def get_messages_for_conversation(session: Session, conversation_id: str) -> list[dict]:
    """Retrieves all messages for a given conversation and returns them as dictionaries."""
    messages = session.exec(select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at)).all()
    # Convert Message objects to dictionaries
    return [message.model_dump() for message in messages]
