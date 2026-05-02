from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    plan_id: int


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    key_id: str
    plan_id: int
    plan_name: str
    mock: bool


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: int


class PlanResponse(BaseModel):
    id: int
    name: str
    product_type: str
    tier: str
    price_amount: float
    price_currency: str
    billing_cycle: str
    features: dict

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    plan_id: int
    customer_id: int
    razorpay_payment_id: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: int
    plan_id: int
    customer_id: int
    tenant_id: Optional[int]
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    auto_renew: bool
    created_at: datetime

    class Config:
        from_attributes = True
