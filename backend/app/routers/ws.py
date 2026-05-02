"""WebSocket hub for real-time QR Menu order updates."""

import logging
from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manage WebSocket connections per restaurant."""

    def __init__(self) -> None:
        # restaurant_id -> set of websockets
        self._connections: dict[int, set[WebSocket]] = defaultdict(set)
        # qr_token -> set of websockets (customer connections)
        self._table_connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect_staff(self, ws: WebSocket, restaurant_id: int) -> None:
        await ws.accept()
        self._connections[restaurant_id].add(ws)
        logger.info("Staff connected to restaurant %d", restaurant_id)

    async def connect_customer(self, ws: WebSocket, qr_token: str) -> None:
        await ws.accept()
        self._table_connections[qr_token].add(ws)
        logger.info("Customer connected via token %s", qr_token[:8])

    def disconnect_staff(self, ws: WebSocket, restaurant_id: int) -> None:
        self._connections[restaurant_id].discard(ws)

    def disconnect_customer(self, ws: WebSocket, qr_token: str) -> None:
        self._table_connections[qr_token].discard(ws)

    async def broadcast_to_restaurant(self, restaurant_id: int, data: dict) -> None:
        """Send to all staff (waiter + kitchen) connected to a restaurant."""
        dead: list[WebSocket] = []
        for ws in self._connections[restaurant_id]:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections[restaurant_id].discard(ws)

    async def broadcast_to_table(self, qr_token: str, data: dict) -> None:
        """Send order updates to customer at a specific table."""
        dead: list[WebSocket] = []
        for ws in self._table_connections[qr_token]:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._table_connections[qr_token].discard(ws)


manager = ConnectionManager()


@router.websocket("/ws/restaurant/{restaurant_id}")
async def ws_restaurant(websocket: WebSocket, restaurant_id: int):
    """Staff (waiter/kitchen) connect here to receive real-time order updates."""
    await manager.connect_staff(websocket, restaurant_id)
    try:
        while True:
            # Keep connection alive; staff can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect_staff(websocket, restaurant_id)
        logger.info("Staff disconnected from restaurant %d", restaurant_id)


@router.websocket("/ws/table/{qr_token}")
async def ws_table(websocket: WebSocket, qr_token: str):
    """Customer connects here to receive order status updates."""
    await manager.connect_customer(websocket, qr_token)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect_customer(websocket, qr_token)
