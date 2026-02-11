from typing import Dict, Any, Optional
from sqlmodel import Session, select
from fastapi import HTTPException
import json

from src.services.database import get_session
from src.models.task import Task
from src.models.user import User
from src.api.websocket_routes import ConnectionManager

# --- Helper Functions (potentially to be moved to a separate service) ---

def _get_user_tasks(session: Session, user_id: str) -> list[Task]:
    """Helper to fetch all tasks for a given user."""
    return session.exec(select(Task).where(Task.user_id == user_id)).all()

def _get_user_task_by_id(session: Session, user_id: str, task_id: int) -> Optional[Task]:
    """Helper to fetch a specific task for a user."""
    return session.exec(select(Task).where(Task.id == task_id, Task.user_id == user_id)).first()

# --- MCP Tool Implementations ---

async def add_task(user_id: str, title: str, description: Optional[str] = None, manager: Optional[ConnectionManager] = None) -> Dict[str, Any]:
    """
    Adds a new task for the specified user.
    Enforces user ownership and persists the task to the database.
    If a manager is provided, it broadcasts the updated task list.
    """
    with next(get_session()) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found.")

        task = Task(user_id=user_id, title=title, description=description)
        session.add(task)
        session.commit()
        session.refresh(task)

        if manager:
            tasks = _get_user_tasks(session, user_id)
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

        # Return the task data in the format expected by the task creation endpoint
        return {
            "status": "success",
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }

async def list_tasks(user_id: str, status: Optional[str] = None) -> Dict[str, Any]:
    """
    Lists tasks for the specified user, optionally filtered by status.
    Enforces user ownership.
    """
    with next(get_session()) as session:
        tasks = _get_user_tasks(session, user_id)
        
        if status:
            if status == "pending":
                tasks = [t for t in tasks if not t.completed]
            elif status == "completed":
                tasks = [t for t in tasks if t.completed]
            else:
                return {"status": "error", "message": "Invalid status filter. Use 'pending' or 'completed'."}
        
        task_list = [{
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "completed": t.completed,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None
        } for t in tasks]
        return {"status": "success", "message": f"Found {len(task_list)} tasks.", "tasks": task_list}

async def update_task(user_id: str, task_id: int, title: Optional[str] = None, description: Optional[str] = None, manager: Optional[ConnectionManager] = None) -> Dict[str, Any]:
    """
    Updates an existing task for the specified user.
    Enforces user ownership and persists changes.
    """
    with next(get_session()) as session:
        task = _get_user_task_by_id(session, user_id, task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found for user {user_id}.")

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        
        session.add(task)
        session.commit()
        session.refresh(task)

        if manager:
            tasks = _get_user_tasks(session, user_id)
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

        # Return the task data in the format expected by the task update endpoint
        return {
            "status": "success",
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }

async def complete_task(user_id: str, task_id: int, manager: Optional[ConnectionManager] = None) -> Dict[str, Any]:
    """
    Marks a task as complete for the specified user.
    Enforces user ownership and persists changes.
    """
    with next(get_session()) as session:
        task = _get_user_task_by_id(session, user_id, task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found for user {user_id}.")
        
        task.completed = True
        session.add(task)
        session.commit()
        session.refresh(task)

        if manager:
            tasks = _get_user_tasks(session, user_id)
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

        # Return the task data in the format expected by the task completion endpoint
        return {
            "status": "success",
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }

async def delete_task(user_id: str, task_id: int, manager: Optional[ConnectionManager] = None) -> Dict[str, Any]:
    """
    Deletes a task for the specified user.
    Enforces user ownership and persists changes.
    """
    with next(get_session()) as session:
        task = _get_user_task_by_id(session, user_id, task_id)
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found for user {user_id}.")
        
        session.delete(task)
        session.commit()

        if manager:
            tasks = _get_user_tasks(session, user_id)
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

        return {"status": "success", "message": f"Task with ID {task_id} deleted."}
