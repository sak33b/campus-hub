import json

import aiomysql
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from app.config import JWT_ALGORITHM, JWT_SECRET
from app.database import get_db
from app.schemas import MessageCreate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


class ConnectionManager:
    def __init__(self):
        self.active = {}

    async def connect(self, user_id, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id, websocket: WebSocket):
        if user_id in self.active:
            self.active[user_id].discard(websocket)
            if not self.active[user_id]:
                self.active.pop(user_id, None)

    async def send_personal(self, user_id, payload):
        if user_id not in self.active:
            return
        # Convert datetime objects to ISO format strings for JSON serialization
        def serialize_datetime(obj):
            if isinstance(obj, dict):
                return {k: serialize_datetime(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [serialize_datetime(item) for item in obj]
            elif hasattr(obj, 'isoformat'):
                return obj.isoformat()
            return obj
        
        message = json.dumps(serialize_datetime(payload))
        for ws in list(self.active[user_id]):
            await ws.send_text(message)


manager = ConnectionManager()


def _user_from_token(token):
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        return int(user_id)
    except ValueError:
        return None


@router.get("/{user_id}")
async def get_conversation(
    user_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT MessageID, SenderID, ReceiverID, Content, Timestamp "
            "FROM Message "
            "WHERE (SenderID = %s AND ReceiverID = %s) "
            "OR (SenderID = %s AND ReceiverID = %s) "
            "ORDER BY Timestamp ASC",
            (current_user["UserID"], user_id, user_id, current_user["UserID"]),
        )
        rows = await cur.fetchall()

    return rows


@router.post("/{user_id}")
async def send_message(
    user_id: int,
    payload: MessageCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user),
):
    if user_id == current_user["UserID"]:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT 1 FROM `User` WHERE UserID = %s", (user_id,))
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        await cur.execute(
            "INSERT INTO Message (SenderID, ReceiverID, Content) VALUES (%s, %s, %s)",
            (current_user["UserID"], user_id, payload.content),
        )
        await conn.commit()
        message_id = cur.lastrowid

        await cur.execute(
            "SELECT MessageID, SenderID, ReceiverID, Content, Timestamp "
            "FROM Message WHERE MessageID = %s",
            (message_id,),
        )
        row = await cur.fetchone()

    await manager.send_personal(user_id, {"type": "message", "data": row})
    return row


@router.websocket("/ws")
async def websocket_messages(websocket: WebSocket):
    token = websocket.query_params.get("token")
    user_id = _user_from_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
