import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class FranchiseTier(str, enum.Enum):
    silver = "silver"
    gold = "gold"
    platinum = "platinum"


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    subdomain = Column(String(100), unique=True, nullable=True)
    custom_domain = Column(String(255), unique=True, nullable=True)
    logo_url = Column(String(500), nullable=True)
    brand_color_primary = Column(String(7), default="#4F46E5")
    brand_color_secondary = Column(String(7), default="#F59E0B")
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    tier = Column(Enum(FranchiseTier), default=FranchiseTier.silver, nullable=False)
    is_active = Column(Boolean, default=True)
    onboarding_fee_paid = Column(Boolean, default=False)

    owner = relationship("User", foreign_keys=[owner_id])
    users = relationship(
        "User", back_populates="tenant", foreign_keys="User.tenant_id"
    )
    products = relationship("Product", back_populates="tenant")
