"""VCard Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class VCardLink(BaseModel):
    label: str
    url: str
    icon: Optional[str] = None


class VCardService(BaseModel):
    title: str
    description: Optional[str] = None
    icon: Optional[str] = None


class VCardTestimonial(BaseModel):
    name: str
    text: str
    role: Optional[str] = None
    avatar_url: Optional[str] = None


class VCardDocument(BaseModel):
    name: str
    url: str
    file_type: Optional[str] = None


class VCardCreateRequest(BaseModel):
    template_id: str = "minimal-clean"
    name: str = Field(..., min_length=1, max_length=200)
    title: Optional[str] = None
    company: Optional[str] = None
    profile_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    custom_links: list[VCardLink] = []
    bio: Optional[str] = None
    services: list[VCardService] = []
    gallery: list[str] = []
    video_url: Optional[str] = None
    testimonials: list[VCardTestimonial] = []
    documents: list[VCardDocument] = []
    custom_colors: dict = {}
    custom_fonts: dict = {}


class VCardUpdateRequest(BaseModel):
    template_id: Optional[str] = None
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    profile_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    custom_links: Optional[list[VCardLink]] = None
    bio: Optional[str] = None
    services: Optional[list[VCardService]] = None
    gallery: Optional[list[str]] = None
    video_url: Optional[str] = None
    testimonials: Optional[list[VCardTestimonial]] = None
    documents: Optional[list[VCardDocument]] = None
    custom_colors: Optional[dict] = None
    custom_fonts: Optional[dict] = None
    status: Optional[str] = None


class VCardResponse(BaseModel):
    id: int
    user_id: int
    tenant_id: Optional[int] = None
    slug: str
    status: str
    template_id: str
    name: str
    title: Optional[str] = None
    company: Optional[str] = None
    profile_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    custom_links: list[VCardLink] = []
    bio: Optional[str] = None
    services: list[VCardService] = []
    gallery: list[str] = []
    video_url: Optional[str] = None
    testimonials: list[VCardTestimonial] = []
    documents: list[VCardDocument] = []
    custom_colors: dict = {}
    custom_fonts: dict = {}
    view_count: int = 0
    click_count: int = 0
    share_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VCardPublicResponse(BaseModel):
    """Slimmed response for public viewing — no user_id or tracking internals."""

    slug: str
    template_id: str
    name: str
    title: Optional[str] = None
    company: Optional[str] = None
    profile_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    custom_links: list[VCardLink] = []
    bio: Optional[str] = None
    services: list[VCardService] = []
    gallery: list[str] = []
    video_url: Optional[str] = None
    testimonials: list[VCardTestimonial] = []
    documents: list[VCardDocument] = []
    custom_colors: dict = {}
    custom_fonts: dict = {}

    class Config:
        from_attributes = True
