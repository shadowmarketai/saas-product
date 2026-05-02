import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import razorpay
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config import settings
from app.database import get_db
from app.models.subscription import Plan, Subscription, SubscriptionStatus
from app.models.user import User, UserRole
from app.schemas.subscription import (
    CreateOrderRequest,
    CreateOrderResponse,
    PlanResponse,
    SubscriptionCreate,
    SubscriptionResponse,
    VerifyPaymentRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans(
    product_type: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[Plan]:
    query = db.query(Plan)
    if product_type:
        query = query.filter(Plan.product_type == product_type)
    return query.all()


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(
    req: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    plan = db.query(Plan).filter(Plan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")

    if not settings.RAZORPAY_KEY_ID:
        return {
            "order_id": "mock_order_123",
            "amount": plan.price_amount * 100,
            "currency": "INR",
            "key_id": "",
            "plan_id": plan.id,
            "plan_name": plan.name,
            "mock": True,
        }

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    order = client.order.create({
        "amount": int(plan.price_amount * 100),
        "currency": "INR",
        "receipt": f"plan_{plan.id}_user_{current_user.id}",
    })
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan_id": plan.id,
        "plan_name": plan.name,
        "mock": False,
    }


@router.post("/verify-payment", response_model=SubscriptionResponse, status_code=201)
async def verify_payment(
    req: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Subscription:
    plan = db.query(Plan).filter(Plan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")

    if not req.razorpay_order_id.startswith("mock_"):
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": req.razorpay_order_id,
                "razorpay_payment_id": req.razorpay_payment_id,
                "razorpay_signature": req.razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            raise HTTPException(400, "Invalid payment signature")

    now = datetime.now(timezone.utc)
    if plan.billing_cycle == "monthly":
        end_date = now + timedelta(days=30)
    else:
        end_date = now + timedelta(days=365)

    subscription = Subscription(
        plan_id=plan.id,
        customer_id=current_user.id,
        tenant_id=current_user.tenant_id,
        status=SubscriptionStatus.active,
        start_date=now,
        end_date=end_date,
        razorpay_subscription_id=req.razorpay_payment_id,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    logger.info("Subscription created for user %s plan %s", current_user.id, plan.id)
    return subscription


@router.post("/", response_model=SubscriptionResponse, status_code=201)
async def create_subscription(
    req: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Subscription:
    plan = db.query(Plan).filter(Plan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")

    now = datetime.now(timezone.utc)
    if plan.billing_cycle == "monthly":
        end_date = now + timedelta(days=30)
    else:
        end_date = now + timedelta(days=365)

    subscription = Subscription(
        plan_id=plan.id,
        customer_id=req.customer_id,
        tenant_id=current_user.tenant_id,
        status=SubscriptionStatus.active,
        start_date=now,
        end_date=end_date,
        razorpay_subscription_id=req.razorpay_payment_id,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get("/", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Subscription]:
    query = db.query(Subscription)
    if current_user.role == UserRole.customer:
        query = query.filter(Subscription.customer_id == current_user.id)
    elif current_user.role == UserRole.franchise_owner:
        query = query.filter(Subscription.tenant_id == current_user.tenant_id)
    return query.offset(skip).limit(limit).all()


@router.patch("/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(404, "Subscription not found")

    if current_user.role == UserRole.customer and sub.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")

    sub.status = SubscriptionStatus.cancelled
    db.commit()
    return {"message": "Subscription cancelled"}
