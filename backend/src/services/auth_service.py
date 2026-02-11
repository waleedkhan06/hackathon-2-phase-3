from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Query, WebSocketException, WebSocket
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from dotenv import load_dotenv
import os
import hashlib
import jwt

from src.models.user import User
from src.services.database import get_session

load_dotenv()

# Get secret key from environment
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "fallback_secret_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 (in production, use bcrypt or similar)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    user_id: str = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

async def get_current_user_websocket(
    websocket: WebSocket,
    token: Optional[str] = Query(None) # Token can be passed as a query parameter
) -> str:
    """Get current user from JWT token for WebSocket connection"""
    if token is None:
        # Try to get token from WebSocket headers if not in query params
        auth_header = websocket.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Not authenticated")

    try:
        payload = verify_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Could not validate credentials")
        return user_id
    except HTTPException: # Catch HTTPExceptions raised by verify_token
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Could not validate credentials")

def validate_user_id(user_id_from_token: str, user_id_from_path: str) -> bool:
    """Validate that user ID in token matches user ID in path"""
    return user_id_from_token == user_id_from_path