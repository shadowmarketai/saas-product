"""Digital Visiting Card (VCard) model."""

import enum

from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import SoftDeleteMixin, TimestampMixin


class VCardStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class VCard(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "vcards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tenant_id = Column(
        Integer, ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True
    )
    slug = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(
        Enum(VCardStatus), default=VCardStatus.draft, nullable=False
    )
    template_id = Column(String(50), default="minimal-clean", nullable=False)

    # Identity
    name = Column(String(200), nullable=False)
    title = Column(String(200))
    company = Column(String(200))
    profile_image_url = Column(String(500))
    logo_url = Column(String(500))

    # Contact
    phone = Column(String(30))
    email = Column(String(200))
    whatsapp = Column(String(30))
    address = Column(Text)

    # Links
    website = Column(String(500))
    linkedin = Column(String(500))
    instagram = Column(String(500))
    github = Column(String(500))
    twitter = Column(String(500))
    youtube = Column(String(500))
    custom_links = Column(JSONB, default=list)

    # Advanced sections
    bio = Column(Text)
    services = Column(JSONB, default=list)
    gallery = Column(JSONB, default=list)
    video_url = Column(String(500))
    testimonials = Column(JSONB, default=list)
    documents = Column(JSONB, default=list)

    # Customization overrides
    custom_colors = Column(JSONB, default=dict)
    custom_fonts = Column(JSONB, default=dict)

    # Tracking
    view_count = Column(Integer, default=0, nullable=False)
    click_count = Column(Integer, default=0, nullable=False)
    share_count = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", backref="vcards")
