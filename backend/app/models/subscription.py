import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class PlanTier(str, enum.Enum):
    starter = "starter"
    pro = "pro"
    business = "business"
    enterprise = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"
    pending = "pending"


class Plan(Base, TimestampMixin):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    product_type = Column(String(50), nullable=False, index=True)
    tier = Column(Enum(PlanTier), nullable=False)
    price_amount = Column(Float, nullable=False)
    price_currency = Column(String(3), default="INR")
    billing_cycle = Column(String(20), default="monthly")
    features = Column(JSON, default=dict)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.pending, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    razorpay_subscription_id = Column(String(255), nullable=True)
    auto_renew = Column(Boolean, default=True)

    plan = relationship("Plan", back_populates="subscriptions")
    customer = relationship("User", back_populates="subscriptions")
