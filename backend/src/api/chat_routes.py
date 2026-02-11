from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlmodel import Session

from src.services.ai_agent_service import get_ai_agent_service, AIAgentService
from src.services.auth_service import get_current_user
from src.models.user import User
from src.models.conversation import Conversation # Import Conversation model for validation
from src.models.message import Message # Import Message model for response_model
from src.services.database import get_session
from src.services.conversation_service import (
    get_or_create_conversation,
    add_message_to_conversation,
    get_messages_for_conversation
)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None # For resuming conversations

class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    action_taken: Optional[str] = None
    tasks: Optional[list] = None # For tool outputs like list_tasks

@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat_with_bot(
    user_id: str,
    chat_request: ChatRequest,
    ai_agent: AIAgentService = Depends(get_ai_agent_service),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session) # Inject database session
):
    # Basic authorization check: ensure user_id in path matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's chat."
        )

    if not chat_request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    try:
        # Get or create conversation based on thread_id
        conversation = get_or_create_conversation(session, user_id, chat_request.thread_id)
        
        # Store user's message
        add_message_to_conversation(
            session,
            conversation.id,
            user_id,
            "user",
            chat_request.message
        )
        
        response_data = await ai_agent.chat(chat_request.message, user_id, conversation.id)
        
        # Populate ChatResponse based on ai_agent's detailed response
        return ChatResponse(
            conversation_id=conversation.id, # Use the conversation ID from our database
            response=response_data.get("assistant_response", "An unexpected error occurred."),
            action_taken=response_data.get("action_taken"),
            tasks=response_data.get("tasks")
        )
    except Exception as e:
        # Log the exception for debugging
        print(f"Error in chat_with_bot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request."
        )

@router.get("/api/{user_id}/conversations/{conversation_id}/messages", response_model=list[Message])
async def get_conversation_messages_route(
    user_id: str,
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this conversation's messages."
        )
    
    # Verify conversation ownership
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or not owned by user."
        )

    messages = get_messages_for_conversation(session, conversation_id)
    return messages

