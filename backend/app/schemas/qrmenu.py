"""QR Menu + Smart Ordering System Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════
# RESTAURANT
# ═══════════════════════════════════════════════


class RestaurantCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    currency: str = "INR"
    tax_percent: float = 0.0
    primary_color: str = "#E85D04"
    accent_color: str = "#D62828"
    template_id: str = "pure-white"


class RestaurantUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    currency: Optional[str] = None
    tax_percent: Optional[float] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None
    template_id: Optional[str] = None
    is_active: Optional[bool] = None
    accept_orders: Optional[bool] = None


class RestaurantResponse(BaseModel):
    id: int
    user_id: int
    tenant_id: Optional[int] = None
    slug: str
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    currency: str
    tax_percent: float
    primary_color: str
    accent_color: str
    template_id: str
    is_active: bool
    accept_orders: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# MENU CATEGORY
# ═══════════════════════════════════════════════


class MenuCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0


class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class MenuCategoryResponse(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# MENU ITEM
# ═══════════════════════════════════════════════


class MenuItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float = Field(..., gt=0)
    diet_type: str = "veg"
    is_available: bool = True
    is_popular: bool = False
    sort_order: int = 0
    preparation_time: Optional[int] = None


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    diet_type: Optional[str] = None
    is_available: Optional[bool] = None
    is_popular: Optional[bool] = None
    sort_order: Optional[int] = None
    preparation_time: Optional[int] = None


class MenuItemResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    diet_type: str
    is_available: bool
    is_popular: bool
    sort_order: int
    preparation_time: Optional[int] = None

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# TABLE
# ═══════════════════════════════════════════════


class TableCreateRequest(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=20)
    label: Optional[str] = None
    capacity: int = 4


class TableUpdateRequest(BaseModel):
    table_number: Optional[str] = None
    label: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None


class TableResponse(BaseModel):
    id: int
    restaurant_id: int
    table_number: str
    label: Optional[str] = None
    capacity: int
    status: str
    qr_token: str

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# ORDER
# ═══════════════════════════════════════════════


class OrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int = Field(1, ge=1, le=50)
    notes: Optional[str] = None


class PlaceOrderRequest(BaseModel):
    items: list[OrderItemRequest] = Field(..., min_length=1)
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: Optional[int] = None
    name: str
    price: float
    quantity: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    restaurant_id: int
    table_id: Optional[int] = None
    order_number: str
    status: str
    notes: Optional[str] = None
    total_amount: float
    call_waiter: bool
    request_bill: bool
    items: list[OrderItemResponse] = []
    table_number: Optional[str] = None
    placed_at: Optional[datetime] = None
    preparing_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    served_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(placed|preparing|ready|served|cancelled)$")


# ═══════════════════════════════════════════════
# PUBLIC MENU (No auth required)
# ═══════════════════════════════════════════════


class PublicMenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    diet_type: str
    is_available: bool
    is_popular: bool
    preparation_time: Optional[int] = None

    class Config:
        from_attributes = True


class PublicMenuCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    items: list[PublicMenuItemResponse] = []

    class Config:
        from_attributes = True


class PublicMenuResponse(BaseModel):
    restaurant_name: str
    restaurant_slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone: Optional[str] = None
    currency: str
    tax_percent: float
    primary_color: str
    accent_color: str
    template_id: str
    table_number: str
    table_id: int
    categories: list[PublicMenuCategoryResponse] = []
