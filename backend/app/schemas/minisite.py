"""MiniSite Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SiteFeature(BaseModel):
    title: str
    description: Optional[str] = None
    icon: Optional[str] = None


class SiteTestimonial(BaseModel):
    name: str
    text: str
    role: Optional[str] = None
    avatar_url: Optional[str] = None


class MiniSiteCreateRequest(BaseModel):
    template_id: str = "gradient-startup"
    site_name: str = Field(..., min_length=1, max_length=200)
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    features: list[SiteFeature] = []
    testimonials: list[SiteTestimonial] = []
    gallery: list[str] = []
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    footer_text: Optional[str] = None
    custom_colors: dict = {}
    custom_fonts: dict = {}


class MiniSiteUpdateRequest(BaseModel):
    template_id: Optional[str] = None
    site_name: Optional[str] = None
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    features: Optional[list[SiteFeature]] = None
    testimonials: Optional[list[SiteTestimonial]] = None
    gallery: Optional[list[str]] = None
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    footer_text: Optional[str] = None
    custom_colors: Optional[dict] = None
    custom_fonts: Optional[dict] = None
    status: Optional[str] = None


class MiniSiteResponse(BaseModel):
    id: int
    user_id: int
    tenant_id: Optional[int] = None
    slug: str
    status: str
    template_id: str
    site_name: str
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    features: list[SiteFeature] = []
    testimonials: list[SiteTestimonial] = []
    gallery: list[str] = []
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    footer_text: Optional[str] = None
    custom_colors: dict = {}
    custom_fonts: dict = {}
    view_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MiniSitePublicResponse(BaseModel):
    slug: str
    template_id: str
    site_name: str
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    features: list[SiteFeature] = []
    testimonials: list[SiteTestimonial] = []
    gallery: list[str] = []
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    footer_text: Optional[str] = None
    custom_colors: dict = {}
    custom_fonts: dict = {}

    class Config:
        from_attributes = True
