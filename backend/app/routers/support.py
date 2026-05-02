import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.support import SupportTicket, TicketMessage, TicketPriority, TicketStatus
from app.models.user import User, UserRole
from app.schemas.support import (
    TicketCreate,
    TicketListResponse,
    TicketMessageCreate,
    TicketMessageResponse,
    TicketResponse,
    TicketStatusUpdate,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support", tags=["support"])


@router.get("/tickets", response_model=list[TicketListResponse])
async def list_tickets(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[SupportTicket]:
    query = db.query(SupportTicket)
    if user.role == UserRole.customer:
        query = query.filter(SupportTicket.created_by_id == user.id)
    elif user.role == UserRole.franchise_owner and user.tenant_id:
        query = query.filter(SupportTicket.tenant_id == user.tenant_id)
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    result = []
    for t in tickets:
        result.append(TicketListResponse(
            id=t.id,
            subject=t.subject,
            status=t.status.value,
            priority=t.priority.value,
            created_by_name=t.created_by.full_name if t.created_by else None,
            created_at=t.created_at,
        ))
    return result


@router.post("/tickets", response_model=TicketResponse, status_code=201)
async def create_ticket(
    req: TicketCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TicketResponse:
    if not user.tenant_id:
        raise HTTPException(400, "User must belong to a tenant to create tickets")

    ticket = SupportTicket(
        subject=req.subject,
        description=req.description,
        priority=TicketPriority(req.priority),
        tenant_id=user.tenant_id,
        created_by_id=user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    logger.info("Ticket #%d created by user %d", ticket.id, user.id)
    return TicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status.value,
        priority=ticket.priority.value,
        tenant_id=ticket.tenant_id,
        created_by_id=ticket.created_by_id,
        created_by_name=user.full_name,
        created_at=ticket.created_at,
    )


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TicketResponse:
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if user.role == UserRole.customer and ticket.created_by_id != user.id:
        raise HTTPException(403, "Access denied")
    if user.role == UserRole.franchise_owner and ticket.tenant_id != user.tenant_id:
        raise HTTPException(403, "Access denied")

    messages = [
        TicketMessageResponse(
            id=m.id,
            ticket_id=m.ticket_id,
            sender_id=m.sender_id,
            sender_name=m.sender.full_name if m.sender else None,
            message=m.message,
            created_at=m.created_at,
        )
        for m in ticket.messages
    ]
    return TicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status.value,
        priority=ticket.priority.value,
        tenant_id=ticket.tenant_id,
        created_by_id=ticket.created_by_id,
        created_by_name=ticket.created_by.full_name if ticket.created_by else None,
        created_at=ticket.created_at,
        messages=messages,
    )


@router.put("/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: int,
    req: TicketStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    if user.role == UserRole.customer:
        raise HTTPException(403, "Only admins can update ticket status")

    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    ticket.status = TicketStatus(req.status)
    db.commit()
    return {"message": "Status updated", "status": req.status}


@router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageResponse, status_code=201)
async def add_message(
    ticket_id: int,
    req: TicketMessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TicketMessageResponse:
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if user.role == UserRole.customer and ticket.created_by_id != user.id:
        raise HTTPException(403, "Access denied")

    msg = TicketMessage(
        ticket_id=ticket_id,
        sender_id=user.id,
        message=req.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return TicketMessageResponse(
        id=msg.id,
        ticket_id=msg.ticket_id,
        sender_id=msg.sender_id,
        sender_name=user.full_name,
        message=msg.message,
        created_at=msg.created_at,
    )
