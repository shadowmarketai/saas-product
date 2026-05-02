"""QR Menu + Smart Ordering System API router."""

import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.routers.ws import manager

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.qrmenu import (
    MenuCategoryCreate,
    MenuCategoryResponse,
    MenuCategoryUpdate,
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
    OrderResponse,
    OrderStatusUpdate,
    PlaceOrderRequest,
    PublicMenuResponse,
    RestaurantCreateRequest,
    RestaurantResponse,
    RestaurantUpdateRequest,
    TableCreateRequest,
    TableResponse,
    TableUpdateRequest,
)
from app.services import qrmenu_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/qrmenu", tags=["qrmenu"])


# ═══════════════════════════════════════════════
# HELPER
# ═══════════════════════════════════════════════


def _get_owned_restaurant(restaurant_id: int, user: User, db: Session):
    r = qrmenu_service.get_restaurant(db, restaurant_id)
    if not r or r.user_id != user.id:
        raise HTTPException(404, "Restaurant not found")
    return r


# ═══════════════════════════════════════════════
# RESTAURANT CRUD (Authenticated)
# ═══════════════════════════════════════════════


@router.get("/restaurants", response_model=list[RestaurantResponse])
async def list_restaurants(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return qrmenu_service.get_restaurants_by_user(db, user.id)


@router.post("/restaurants", response_model=RestaurantResponse, status_code=201)
async def create_restaurant(
    req: RestaurantCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = req.model_dump(exclude_none=True)
    return qrmenu_service.create_restaurant(
        db, user_id=user.id, tenant_id=user.tenant_id, data=data
    )


@router.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_owned_restaurant(restaurant_id, user, db)


@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: int,
    req: RestaurantUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = _get_owned_restaurant(restaurant_id, user, db)
    return qrmenu_service.update_restaurant(db, r, req.model_dump(exclude_none=True))


@router.delete("/restaurants/{restaurant_id}", status_code=204)
async def delete_restaurant(
    restaurant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = _get_owned_restaurant(restaurant_id, user, db)
    qrmenu_service.soft_delete_restaurant(db, r)


# ═══════════════════════════════════════════════
# MENU CATEGORIES (Authenticated)
# ═══════════════════════════════════════════════


@router.get(
    "/restaurants/{restaurant_id}/categories",
    response_model=list[MenuCategoryResponse],
)
async def list_categories(
    restaurant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_restaurant(restaurant_id, user, db)
    return qrmenu_service.get_categories(db, restaurant_id)


@router.post(
    "/restaurants/{restaurant_id}/categories",
    response_model=MenuCategoryResponse,
    status_code=201,
)
async def create_category(
    restaurant_id: int,
    req: MenuCategoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_restaurant(restaurant_id, user, db)
    return qrmenu_service.create_category(
        db, restaurant_id, req.model_dump(exclude_none=True)
    )


@router.put("/categories/{category_id}", response_model=MenuCategoryResponse)
async def update_category(
    category_id: int,
    req: MenuCategoryUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(qrmenu_service.MenuCategory).get(category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    _get_owned_restaurant(cat.restaurant_id, user, db)
    return qrmenu_service.update_category(db, cat, req.model_dump(exclude_none=True))


@router.delete("/categories/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(qrmenu_service.MenuCategory).get(category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    _get_owned_restaurant(cat.restaurant_id, user, db)
    qrmenu_service.delete_category(db, cat)


# ═══════════════════════════════════════════════
# MENU ITEMS (Authenticated)
# ═══════════════════════════════════════════════


@router.get(
    "/categories/{category_id}/items",
    response_model=list[MenuItemResponse],
)
async def list_items(
    category_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(qrmenu_service.MenuCategory).get(category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    _get_owned_restaurant(cat.restaurant_id, user, db)
    return qrmenu_service.get_menu_items(db, category_id)


@router.post(
    "/categories/{category_id}/items",
    response_model=MenuItemResponse,
    status_code=201,
)
async def create_item(
    category_id: int,
    req: MenuItemCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = db.query(qrmenu_service.MenuCategory).get(category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    _get_owned_restaurant(cat.restaurant_id, user, db)
    return qrmenu_service.create_menu_item(
        db, category_id, req.model_dump(exclude_none=True)
    )


@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_item(
    item_id: int,
    req: MenuItemUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(qrmenu_service.MenuItem).get(item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    cat = db.query(qrmenu_service.MenuCategory).get(item.category_id)
    _get_owned_restaurant(cat.restaurant_id, user, db)
    return qrmenu_service.update_menu_item(db, item, req.model_dump(exclude_none=True))


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(qrmenu_service.MenuItem).get(item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    cat = db.query(qrmenu_service.MenuCategory).get(item.category_id)
    _get_owned_restaurant(cat.restaurant_id, user, db)
    qrmenu_service.delete_menu_item(db, item)


# ═══════════════════════════════════════════════
# TABLES (Authenticated)
# ═══════════════════════════════════════════════


@router.get(
    "/restaurants/{restaurant_id}/tables",
    response_model=list[TableResponse],
)
async def list_tables(
    restaurant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_restaurant(restaurant_id, user, db)
    return qrmenu_service.get_tables(db, restaurant_id)


@router.post(
    "/restaurants/{restaurant_id}/tables",
    response_model=TableResponse,
    status_code=201,
)
async def create_table(
    restaurant_id: int,
    req: TableCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_restaurant(restaurant_id, user, db)
    return qrmenu_service.create_table(
        db, restaurant_id, req.model_dump(exclude_none=True)
    )


@router.put("/tables/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: int,
    req: TableUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    table = db.query(qrmenu_service.RestaurantTable).get(table_id)
    if not table:
        raise HTTPException(404, "Table not found")
    _get_owned_restaurant(table.restaurant_id, user, db)
    return qrmenu_service.update_table(db, table, req.model_dump(exclude_none=True))


@router.delete("/tables/{table_id}", status_code=204)
async def delete_table(
    table_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    table = db.query(qrmenu_service.RestaurantTable).get(table_id)
    if not table:
        raise HTTPException(404, "Table not found")
    _get_owned_restaurant(table.restaurant_id, user, db)
    qrmenu_service.delete_table(db, table)


# ═══════════════════════════════════════════════
# ORDERS — Management (Authenticated)
# ═══════════════════════════════════════════════


@router.get(
    "/restaurants/{restaurant_id}/orders",
    response_model=list[OrderResponse],
)
async def list_orders(
    restaurant_id: int,
    status: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_restaurant(restaurant_id, user, db)
    orders = qrmenu_service.get_orders_by_restaurant(db, restaurant_id, status)
    return [_order_to_response(o) for o in orders]


@router.get(
    "/restaurants/{restaurant_id}/orders/active",
    response_model=list[OrderResponse],
)
async def list_active_orders(
    restaurant_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Real-time feed for waiter/kitchen dashboards."""
    _get_owned_restaurant(restaurant_id, user, db)
    orders = qrmenu_service.get_active_orders(db, restaurant_id)
    return [_order_to_response(o) for o in orders]


@router.patch(
    "/orders/{order_id}/status",
    response_model=OrderResponse,
)
async def update_order_status(
    order_id: int,
    req: OrderStatusUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = qrmenu_service.get_order(db, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    _get_owned_restaurant(order.restaurant_id, user, db)
    updated = qrmenu_service.update_order_status(db, order, req.status)
    response = _order_to_response(updated)
    order_data = response.model_dump(mode="json")
    # Broadcast to staff
    asyncio.ensure_future(
        manager.broadcast_to_restaurant(order.restaurant_id, {
            "type": "order_update",
            "order": order_data,
        })
    )
    # Broadcast to customer at the table
    if updated.table and updated.table.qr_token:
        asyncio.ensure_future(
            manager.broadcast_to_table(updated.table.qr_token, {
                "type": "order_update",
                "order": order_data,
            })
        )
    return response


# ═══════════════════════════════════════════════
# PUBLIC ENDPOINTS (No auth — customer facing)
# ═══════════════════════════════════════════════


@router.get("/public/menu/{qr_token}", response_model=PublicMenuResponse)
async def get_public_menu(qr_token: str, db: Session = Depends(get_db)):
    """Customer scans QR → gets full menu."""
    result = qrmenu_service.get_public_menu(db, qr_token)
    if not result:
        raise HTTPException(404, "Menu not found or restaurant inactive")

    r = result["restaurant"]
    t = result["table"]
    return PublicMenuResponse(
        restaurant_name=r.name,
        restaurant_slug=r.slug,
        description=r.description,
        logo_url=r.logo_url,
        cover_image_url=r.cover_image_url,
        phone=r.phone,
        currency=r.currency,
        tax_percent=r.tax_percent,
        primary_color=r.primary_color,
        accent_color=r.accent_color,
        template_id=r.template_id,
        table_number=t.table_number,
        table_id=t.id,
        categories=result["categories"],
    )


@router.post("/public/order/{qr_token}", response_model=OrderResponse)
async def place_public_order(
    qr_token: str,
    req: PlaceOrderRequest,
    db: Session = Depends(get_db),
):
    """Customer places order from phone — no login required."""
    table = qrmenu_service.get_table_by_token(db, qr_token)
    if not table:
        raise HTTPException(404, "Invalid table")

    restaurant = qrmenu_service.get_restaurant(db, table.restaurant_id)
    if not restaurant or not restaurant.accept_orders:
        raise HTTPException(400, "Restaurant not accepting orders")

    order = qrmenu_service.place_order(
        db,
        restaurant_id=restaurant.id,
        table_id=table.id,
        data=req.model_dump(),
    )
    # Broadcast to staff dashboards
    order_data = _order_to_response(order).model_dump(mode="json")
    asyncio.ensure_future(
        manager.broadcast_to_restaurant(restaurant.id, {
            "type": "new_order",
            "order": order_data,
        })
    )
    return _order_to_response(order)


@router.get("/public/orders/{qr_token}", response_model=list[OrderResponse])
async def get_table_orders(qr_token: str, db: Session = Depends(get_db)):
    """Customer tracks their active orders."""
    orders = qrmenu_service.get_orders_by_table_token(db, qr_token)
    return [_order_to_response(o) for o in orders]


@router.post("/public/orders/{order_id}/call-waiter")
async def call_waiter(order_id: int, db: Session = Depends(get_db)):
    order = qrmenu_service.call_waiter_toggle(db, order_id, True)
    if not order:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


@router.post("/public/orders/{order_id}/request-bill")
async def request_bill(order_id: int, db: Session = Depends(get_db)):
    order = qrmenu_service.request_bill_toggle(db, order_id, True)
    if not order:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


# ═══════════════════════════════════════════════
# RESPONSE HELPER
# ═══════════════════════════════════════════════


def _order_to_response(order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        restaurant_id=order.restaurant_id,
        table_id=order.table_id,
        order_number=order.order_number,
        status=order.status.value if hasattr(order.status, "value") else order.status,
        notes=order.notes,
        total_amount=order.total_amount,
        call_waiter=order.call_waiter,
        request_bill=order.request_bill,
        items=order.items,
        table_number=order.table.table_number if order.table else None,
        placed_at=order.placed_at,
        preparing_at=order.preparing_at,
        ready_at=order.ready_at,
        served_at=order.served_at,
    )
