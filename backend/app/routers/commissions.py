from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_superadmin, get_current_user
from app.database import get_db
from app.models.commission import Commission, CommissionStatus
from app.models.user import User, UserRole

router = APIRouter(prefix="/commissions", tags=["commissions"])


@router.get("/")
async def list_commissions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    query = db.query(Commission)
    if current_user.role == UserRole.franchise_owner:
        query = query.filter(Commission.tenant_id == current_user.tenant_id)
    elif current_user.role == UserRole.customer:
        raise HTTPException(403, "Access denied")

    commissions = query.offset(skip).limit(limit).all()
    return [
        {
            "id": c.id,
            "tenant_id": c.tenant_id,
            "subscription_id": c.subscription_id,
            "amount": float(c.amount),
            "percentage": float(c.percentage),
            "status": c.status.value,
            "payout_date": c.payout_date.isoformat() if c.payout_date else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in commissions
    ]


@router.get("/summary")
async def commission_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    query = db.query(Commission)
    if current_user.role == UserRole.franchise_owner:
        query = query.filter(Commission.tenant_id == current_user.tenant_id)
    elif current_user.role == UserRole.customer:
        raise HTTPException(403, "Access denied")

    total_earned = (
        query.with_entities(func.coalesce(func.sum(Commission.amount), 0)).scalar()
    )
    total_pending = (
        query.filter(Commission.status == CommissionStatus.pending)
        .with_entities(func.coalesce(func.sum(Commission.amount), 0))
        .scalar()
    )
    total_paid = (
        query.filter(Commission.status == CommissionStatus.paid)
        .with_entities(func.coalesce(func.sum(Commission.amount), 0))
        .scalar()
    )

    return {
        "total_earned": float(total_earned),
        "total_pending": float(total_pending),
        "total_paid": float(total_paid),
    }


@router.patch("/{commission_id}/process")
async def process_commission(
    commission_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> dict:
    commission = db.query(Commission).filter(Commission.id == commission_id).first()
    if not commission:
        raise HTTPException(404, "Commission not found")

    commission.status = CommissionStatus.paid
    db.commit()
    return {"message": "Commission marked as paid"}


@router.patch("/{commission_id}")
async def update_commission_status(
    commission_id: int,
    status: CommissionStatus,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> dict:
    """Update commission status to any valid CommissionStatus value (pending/processing/paid)."""
    commission = db.query(Commission).filter(Commission.id == commission_id).first()
    if not commission:
        raise HTTPException(404, "Commission not found")

    commission.status = status
    db.commit()
    return {"id": commission_id, "status": status.value}
