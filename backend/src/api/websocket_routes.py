from typing import List, Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status, HTTPException
from sqlmodel import Session, select
import json

from src.models.task import Task
from src.services.database import get_session
from src.services.auth_service import get_current_user_websocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_user(self, user_id: str, message: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

    async def broadcast(self, message: str):
        for user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

manager = ConnectionManager()
websocket_router = APIRouter(tags=["websockets"])

@websocket_router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    current_user: str = Depends(get_current_user_websocket), # Authenticate WebSocket connection
    session: Session = Depends(get_session)
):
    if current_user != user_id:
        # This will raise a WebSocketDisconnect or similar error.
        # FastAPI handles this by closing the connection.
        # Alternatively, we could explicitly raise HTTPException
        # but for websockets, simple return might be enough for FastAPI to close.
        print(f"WebSocket authentication failed for user_id: {user_id}. Expected: {current_user}")
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION) 

    await manager.connect(websocket, user_id)
    try:
        # Send initial tasks to the newly connected user
        tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
        # Convert tasks to a list of dictionaries for JSON serialization
        tasks_data = [task.model_dump() for task in tasks]
        await manager.send_personal_message(json.dumps({"type": "initial_tasks", "tasks": tasks_data}), websocket)

        while True:
            # Keep the connection alive, await incoming messages
            # For now, we don't expect client to send messages frequently, mostly server-to-client
            await websocket.receive_text() # This will block until a message is received or connection closed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        print(f"User {user_id} disconnected from WebSocket.")
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)
