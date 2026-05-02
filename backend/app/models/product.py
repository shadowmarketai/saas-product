import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class ProductType(str, enum.Enum):
    vcard = "vcard"
    website = "website"
    google_reviews = "google_reviews"
    qr_menu = "qr_menu"
    social_poster = "social_poster"
    link_in_bio = "link_in_bio"
    whatsapp_chatbot = "whatsapp_chatbot"


class ProductTemplate(Base, TimestampMixin):
    __tablename__ = "product_templates"

    id = Column(Integer, primary_key=True, index=True)
    product_type = Column(Enum(ProductType), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    industry = Column(String(100), nullable=True, index=True)
    style = Column(String(50), nullable=True)
    is_premium = Column(Boolean, default=False)
    config_json = Column(JSON, default=dict)

    products = relationship("Product", back_populates="template")


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_type = Column(Enum(ProductType), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, index=True)
    config_data = Column(JSON, default=dict)
    is_published = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    template_id = Column(
        Integer, ForeignKey("product_templates.id", ondelete="SET NULL"), nullable=True
    )
    customer_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tenant_id = Column(
        Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    created_by_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    template = relationship("ProductTemplate", back_populates="products")
    customer = relationship("User", foreign_keys=[customer_id])
    created_by = relationship("User", back_populates="created_products", foreign_keys=[created_by_id])
    tenant = relationship("Tenant", back_populates="products")
    analytics = relationship("ProductAnalytics", back_populates="product")
