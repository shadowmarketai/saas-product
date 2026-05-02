"""QR Menu + Smart Ordering System models."""

import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base
from app.models.base import SoftDeleteMixin, TimestampMixin


# ═══════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════


class DietType(str, enum.Enum):
    veg = "veg"
    non_veg = "non_veg"
    vegan = "vegan"
    egg = "egg"


class OrderStatus(str, enum.Enum):
    placed = "placed"
    preparing = "preparing"
    ready = "ready"
    served = "served"
    cancelled = "cancelled"


class TableStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    reserved = "reserved"


# ═══════════════════════════════════════════════
# RESTAURANT
# ═══════════════════════════════════════════════


class Restaurant(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tenant_id = Column(
        Integer, ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True
    )
    slug = Column(String(100), unique=True, index=True, nullable=False)

    name = Column(String(200), nullable=False)
    description = Column(Text)
    logo_url = Column(Text)
    cover_image_url = Column(Text)
    phone = Column(String(30))
    address = Column(Text)
    currency = Column(String(10), default="INR", nullable=False)
    tax_percent = Column(Float, default=0.0)

    # Branding
    primary_color = Column(String(10), default="#E85D04")
    accent_color = Column(String(10), default="#D62828")
    template_id = Column(String(50), default="pure-white")

    # Settings
    is_active = Column(Boolean, default=True)
    accept_orders = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", backref="restaurants")
    categories = relationship(
        "MenuCategory", back_populates="restaurant", cascade="all, delete-orphan"
    )
    tables = relationship(
        "RestaurantTable", back_populates="restaurant", cascade="all, delete-orphan"
    )
    orders = relationship(
        "Order", back_populates="restaurant", cascade="all, delete-orphan"
    )


# ═══════════════════════════════════════════════
# MENU CATEGORY
# ═══════════════════════════════════════════════


class MenuCategory(Base, TimestampMixin):
    __tablename__ = "menu_categories"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(
        Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(String(300))
    icon = Column(String(10))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="categories")
    items = relationship(
        "MenuItem", back_populates="category", cascade="all, delete-orphan"
    )


# ═══════════════════════════════════════════════
# MENU ITEM
# ═══════════════════════════════════════════════


class MenuItem(Base, TimestampMixin):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(
        Integer, ForeignKey("menu_categories.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(200), nullable=False)
    description = Column(Text)
    image_url = Column(Text)
    price = Column(Float, nullable=False)
    diet_type = Column(Enum(DietType), default=DietType.veg, nullable=False)
    is_available = Column(Boolean, default=True)
    is_popular = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    preparation_time = Column(Integer)  # minutes

    # Relationships
    category = relationship("MenuCategory", back_populates="items")


# ═══════════════════════════════════════════════
# TABLE
# ═══════════════════════════════════════════════


class RestaurantTable(Base, TimestampMixin):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(
        Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    table_number = Column(String(20), nullable=False)
    label = Column(String(50))  # e.g. "Window Seat", "VIP Room"
    capacity = Column(Integer, default=4)
    status = Column(Enum(TableStatus), default=TableStatus.available, nullable=False)
    qr_token = Column(String(64), unique=True, index=True, nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="tables")
    orders = relationship("Order", back_populates="table")


# ═══════════════════════════════════════════════
# ORDER
# ═══════════════════════════════════════════════


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(
        Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False
    )
    table_id = Column(
        Integer, ForeignKey("restaurant_tables.id", ondelete="SET NULL"), nullable=True
    )
    order_number = Column(String(20), unique=True, index=True, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.placed, nullable=False)
    notes = Column(Text)
    total_amount = Column(Float, default=0.0)

    # Timestamps for status tracking
    placed_at = Column(DateTime(timezone=True), server_default=func.now())
    preparing_at = Column(DateTime(timezone=True))
    ready_at = Column(DateTime(timezone=True))
    served_at = Column(DateTime(timezone=True))

    # Customer request flags
    call_waiter = Column(Boolean, default=False)
    request_bill = Column(Boolean, default=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="orders")
    table = relationship("RestaurantTable", back_populates="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


# ═══════════════════════════════════════════════
# ORDER ITEM
# ═══════════════════════════════════════════════


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    menu_item_id = Column(
        Integer, ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True
    )
    name = Column(String(200), nullable=False)  # Denormalized for history
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    notes = Column(String(300))

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")
