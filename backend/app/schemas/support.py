from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "medium"


class TicketStatusUpdate(BaseModel):
    status: str


class TicketMessageCreate(BaseModel):
    message: str


class TicketMessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    sender_name: Optional[str] = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    id: int
    subject: str
    description: str
    status: str
    priority: str
    tenant_id: int
    created_by_id: int
    created_by_name: Optional[str] = None
    created_at: datetime
    messages: list[TicketMessageResponse] = []

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    id: int
    subject: str
    status: str
    priority: str
    created_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
