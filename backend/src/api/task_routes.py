from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import json
from src.api.websocket_routes import manager

from src.models.task import Task
from pydantic import BaseModel
from src.models.user import User
from src.services.auth_service import get_current_user, validate_user_id, verify_token
from src.services.database import get_session

# Create Pydantic models for request bodies
class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None

router = APIRouter(prefix="/api/{user_id}", tags=["tasks"])

def verify_user_id_match(token_credentials: str, path_user_id: str) -> str:
    """Verify that the user_id in the JWT token matches the user_id in the path"""
    payload = verify_token(token_credentials)
    token_user_id = payload.get("sub")

    if not validate_user_id(token_user_id, path_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    return token_user_id

@router.get("/tasks", response_model=List[Task])
def read_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all tasks for a specific user"""
    # Verify that the user_id in path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks

@router.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task for the user and broadcast the update."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    task_data = task.model_dump()
    db_task = Task(user_id=user_id, **task_data)

    session.add(db_task)
    session.flush()

    # After creating, get all tasks and broadcast
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    # Convert tasks to dict and serialize datetime fields properly
    tasks_data = [{
        "id": t.id,
        "user_id": t.user_id,
        "title": t.title,
        "description": t.description,
        "completed": t.completed,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None
    } for t in tasks]
    await manager.broadcast_to_user(user_id, json.dumps({"type": "tasks_updated", "tasks": tasks_data}))

    return db_task

@router.get("/tasks/{id}", response_model=Task)
def read_task(
    user_id: str,
    id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific task by ID"""
    # Verify that the user_id in path matches the authenticated user
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    statement = select(Task).where(Task.id == id, Task.user_id == user_id)
    db_task = session.exec(statement).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return db_task

@router.put("/tasks/{id}", response_model=Task)
async def update_task(
    user_id: str,
    id: int,
    task: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a specific task by ID and broadcast the update."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    db_task = session.exec(select(Task).where(Task.id == id, Task.user_id == user_id)).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = task.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    session.add(db_task)
    session.flush()

    # After updating, get all tasks and broadcast
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    # Convert tasks to dict and serialize datetime fields properly
    tasks_data = [{
        "id": t.id,
        "user_id": t.user_id,
        "title": t.title,
        "description": t.description,
        "completed": t.completed,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None
    } for t in tasks]
    await manager.broadcast_to_user(user_id, json.dumps({"type": "tasks_updated", "tasks": tasks_data}))

    return db_task

@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a specific task by ID and broadcast the update."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    db_task = session.exec(select(Task).where(Task.id == id, Task.user_id == user_id)).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    session.delete(db_task)
    session.flush()

    # After deleting, get all tasks and broadcast
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    # Convert tasks to dict and serialize datetime fields properly
    tasks_data = [{
        "id": t.id,
        "user_id": t.user_id,
        "title": t.title,
        "description": t.description,
        "completed": t.completed,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None
    } for t in tasks]
    await manager.broadcast_to_user(user_id, json.dumps({"type": "tasks_updated", "tasks": tasks_data}))

    return

@router.patch("/tasks/{id}/complete", response_model=Task)
async def toggle_task_completion(
    user_id: str,
    id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Toggle the completion status of a task and broadcast the update."""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )

    db_task = session.exec(select(Task).where(Task.id == id, Task.user_id == user_id)).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db_task.completed = not db_task.completed
    
    session.add(db_task)
    session.flush()

    # After toggling, get all tasks and broadcast
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    # Convert tasks to dict and serialize datetime fields properly
    tasks_data = [{
        "id": t.id,
        "user_id": t.user_id,
        "title": t.title,
        "description": t.description,
        "completed": t.completed,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None
    } for t in tasks]
    await manager.broadcast_to_user(user_id, json.dumps({"type": "tasks_updated", "tasks": tasks_data}))

    return db_task