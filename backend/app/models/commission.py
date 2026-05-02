import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class CommissionStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    paid = "paid"


class Commission(Base, TimestampMixin):
    __tablename__ = "commissions"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    status = Column(Enum(CommissionStatus), default=CommissionStatus.pending, nullable=False)
    payout_date = Column(DateTime(timezone=True), nullable=True)


class Referral(Base, TimestampMixin):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    referred_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bonus_amount = Column(Float, default=100.0)
    is_converted = Column(Boolean, default=False)
    converted_at = Column(DateTime(timezone=True), nullable=True)

    referrer = relationship("User", foreign_keys=[referrer_id])
    referred = relationship("User", foreign_keys=[referred_id])
