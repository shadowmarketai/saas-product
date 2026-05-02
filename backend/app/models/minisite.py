"""Mini Website (MiniSite) model."""

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


class MiniSiteStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class MiniSite(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "minisites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    tenant_id = Column(
        Integer, ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True
    )
    slug = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(
        Enum(MiniSiteStatus), default=MiniSiteStatus.draft, nullable=False
    )
    template_id = Column(String(50), default="gradient-startup", nullable=False)

    # Site identity
    site_name = Column(String(200), nullable=False)
    tagline = Column(String(300))
    logo_url = Column(String(500))
    favicon_url = Column(String(500))

    # Hero section
    hero_title = Column(String(300))
    hero_subtitle = Column(Text)
    hero_image_url = Column(String(500))
    hero_cta_text = Column(String(100))
    hero_cta_url = Column(String(500))

    # About section
    about_title = Column(String(200))
    about_text = Column(Text)
    about_image_url = Column(String(500))

    # Features / services (JSON array)
    features = Column(JSONB, default=list)

    # Testimonials (JSON array)
    testimonials = Column(JSONB, default=list)

    # Gallery images (JSON array of URLs)
    gallery = Column(JSONB, default=list)

    # CTA section
    cta_title = Column(String(300))
    cta_subtitle = Column(Text)
    cta_button_text = Column(String(100))
    cta_button_url = Column(String(500))

    # Contact
    phone = Column(String(30))
    email = Column(String(200))
    address = Column(Text)
    whatsapp = Column(String(30))

    # Social links
    website = Column(String(500))
    linkedin = Column(String(500))
    instagram = Column(String(500))
    github = Column(String(500))
    twitter = Column(String(500))
    youtube = Column(String(500))

    # Footer
    footer_text = Column(String(500))

    # Customization
    custom_colors = Column(JSONB, default=dict)
    custom_fonts = Column(JSONB, default=dict)

    # Tracking
    view_count = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", backref="minisites")
