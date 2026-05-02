from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TenantCreate(BaseModel):
    name: str
    slug: str
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    logo_url: Optional[str] = None
    brand_color_primary: str = "#4F46E5"
    brand_color_secondary: str = "#F59E0B"
    owner_email: str
    owner_name: str
    owner_password: str


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    logo_url: Optional[str] = None
    brand_color_primary: Optional[str] = None
    brand_color_secondary: Optional[str] = None
    tier: Optional[str] = None


class TenantResponse(BaseModel):
    id: int
    name: str
    slug: str
    subdomain: Optional[str]
    custom_domain: Optional[str]
    logo_url: Optional[str]
    brand_color_primary: str
    brand_color_secondary: str
    tier: str
    is_active: bool
    onboarding_fee_paid: bool
    owner_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
