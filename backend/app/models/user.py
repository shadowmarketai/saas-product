import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import SoftDeleteMixin, TimestampMixin


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    franchise_owner = "franchise_owner"
    customer = "customer"


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    avatar_url = Column(String(500), nullable=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)
    verification_token = Column(String(64), nullable=True)

    tenant = relationship("Tenant", back_populates="users", foreign_keys=[tenant_id])
    created_products = relationship(
        "Product",
        back_populates="created_by",
        foreign_keys="Product.created_by_id",
    )
    subscriptions = relationship("Subscription", back_populates="customer")
