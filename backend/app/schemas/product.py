from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProductCreate(BaseModel):
    product_type: str
    name: str
    slug: Optional[str] = None
    config_data: dict = {}
    template_id: Optional[int] = None
    customer_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    config_data: Optional[dict] = None
    is_published: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    product_type: str
    name: str
    slug: str
    config_data: dict
    is_published: bool
    is_active: bool
    template_id: Optional[int]
    customer_id: int
    tenant_id: Optional[int]
    created_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateResponse(BaseModel):
    id: int
    product_type: str
    name: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    industry: Optional[str]
    style: Optional[str]
    is_premium: bool
    config_json: dict

    class Config:
        from_attributes = True
