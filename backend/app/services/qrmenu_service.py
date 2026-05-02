"""QR Menu + Smart Ordering System service layer."""

import logging
import secrets
import uuid
from datetime import datetime, timezone

from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload

from app.models.qrmenu import (
    DietType,
    MenuCategory,
    MenuItem,
    Order,
    OrderItem,
    OrderStatus,
    Restaurant,
    RestaurantTable,
    TableStatus,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════
# SLUG / TOKEN GENERATORS
# ═══════════════════════════════════════════════


def _generate_slug(name: str) -> str:
    base = name.lower().replace(" ", "-")[:40]
    base = "".join(c for c in base if c.isalnum() or c == "-")
    return f"{base}-{secrets.token_hex(4)}"


def _generate_qr_token() -> str:
    return secrets.token_urlsafe(32)


def _generate_order_number() -> str:
    return f"ORD-{uuid.uuid4().hex[:8].upper()}"


# ═══════════════════════════════════════════════
# RESTAURANT
# ═══════════════════════════════════════════════


def create_restaurant(
    db: Session, user_id: int, tenant_id: int | None, data: dict
) -> Restaurant:
    restaurant = Restaurant(
        user_id=user_id,
        tenant_id=tenant_id,
        slug=_generate_slug(data["name"]),
        **data,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    logger.info("Restaurant created: %s (id=%d)", restaurant.name, restaurant.id)
    return restaurant


def get_restaurant(db: Session, restaurant_id: int) -> Restaurant | None:
    return db.query(Restaurant).filter(
        Restaurant.id == restaurant_id, Restaurant.is_deleted.is_(False)
    ).first()


def get_restaurant_by_slug(db: Session, slug: str) -> Restaurant | None:
    return db.query(Restaurant).filter(
        Restaurant.slug == slug, Restaurant.is_deleted.is_(False)
    ).first()


def get_restaurants_by_user(db: Session, user_id: int) -> list[Restaurant]:
    return (
        db.query(Restaurant)
        .filter(Restaurant.user_id == user_id, Restaurant.is_deleted.is_(False))
        .order_by(Restaurant.created_at.desc())
        .all()
    )


def update_restaurant(
    db: Session, restaurant: Restaurant, data: dict
) -> Restaurant:
    for key, val in data.items():
        if val is not None:
            setattr(restaurant, key, val)
    db.commit()
    db.refresh(restaurant)
    return restaurant


def soft_delete_restaurant(db: Session, restaurant: Restaurant) -> None:
    restaurant.is_deleted = True
    restaurant.deleted_at = datetime.now(timezone.utc)
    db.commit()


# ═══════════════════════════════════════════════
# MENU CATEGORIES
# ═══════════════════════════════════════════════


def create_category(
    db: Session, restaurant_id: int, data: dict
) -> MenuCategory:
    category = MenuCategory(restaurant_id=restaurant_id, **data)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_categories(db: Session, restaurant_id: int) -> list[MenuCategory]:
    return (
        db.query(MenuCategory)
        .filter(MenuCategory.restaurant_id == restaurant_id)
        .order_by(MenuCategory.sort_order, MenuCategory.id)
        .all()
    )


def update_category(
    db: Session, category: MenuCategory, data: dict
) -> MenuCategory:
    for key, val in data.items():
        if val is not None:
            setattr(category, key, val)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: MenuCategory) -> None:
    db.delete(category)
    db.commit()


# ═══════════════════════════════════════════════
# MENU ITEMS
# ═══════════════════════════════════════════════


def create_menu_item(
    db: Session, category_id: int, data: dict
) -> MenuItem:
    diet = data.pop("diet_type", "veg")
    item = MenuItem(
        category_id=category_id,
        diet_type=DietType(diet),
        **data,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_menu_items(db: Session, category_id: int) -> list[MenuItem]:
    return (
        db.query(MenuItem)
        .filter(MenuItem.category_id == category_id)
        .order_by(MenuItem.sort_order, MenuItem.id)
        .all()
    )


def update_menu_item(db: Session, item: MenuItem, data: dict) -> MenuItem:
    for key, val in data.items():
        if val is not None:
            if key == "diet_type":
                val = DietType(val)
            setattr(item, key, val)
    db.commit()
    db.refresh(item)
    return item


def delete_menu_item(db: Session, item: MenuItem) -> None:
    db.delete(item)
    db.commit()


# ═══════════════════════════════════════════════
# TABLES
# ═══════════════════════════════════════════════


def create_table(
    db: Session, restaurant_id: int, data: dict
) -> RestaurantTable:
    table = RestaurantTable(
        restaurant_id=restaurant_id,
        qr_token=_generate_qr_token(),
        **data,
    )
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


def get_tables(db: Session, restaurant_id: int) -> list[RestaurantTable]:
    return (
        db.query(RestaurantTable)
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .order_by(RestaurantTable.table_number)
        .all()
    )


def get_table_by_token(db: Session, qr_token: str) -> RestaurantTable | None:
    return (
        db.query(RestaurantTable)
        .filter(RestaurantTable.qr_token == qr_token)
        .first()
    )


def update_table(
    db: Session, table: RestaurantTable, data: dict
) -> RestaurantTable:
    for key, val in data.items():
        if val is not None:
            if key == "status":
                val = TableStatus(val)
            setattr(table, key, val)
    db.commit()
    db.refresh(table)
    return table


def delete_table(db: Session, table: RestaurantTable) -> None:
    db.delete(table)
    db.commit()


# ═══════════════════════════════════════════════
# PUBLIC MENU (No auth)
# ═══════════════════════════════════════════════


def get_public_menu(db: Session, qr_token: str) -> dict | None:
    """Fetch full menu for a table's QR token."""
    table = get_table_by_token(db, qr_token)
    if not table:
        return None

    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == table.restaurant_id, Restaurant.is_deleted.is_(False))
        .first()
    )
    if not restaurant or not restaurant.is_active:
        return None

    categories = (
        db.query(MenuCategory)
        .filter(
            MenuCategory.restaurant_id == restaurant.id,
            MenuCategory.is_active.is_(True),
        )
        .options(joinedload(MenuCategory.items))
        .order_by(MenuCategory.sort_order, MenuCategory.id)
        .all()
    )

    return {
        "restaurant": restaurant,
        "table": table,
        "categories": [
            {
                "id": cat.id,
                "name": cat.name,
                "description": cat.description,
                "icon": cat.icon,
                "items": [
                    item
                    for item in sorted(cat.items, key=lambda x: (x.sort_order, x.id))
                    if item.is_available
                ],
            }
            for cat in categories
        ],
    }


# ═══════════════════════════════════════════════
# ORDERS
# ═══════════════════════════════════════════════


def place_order(
    db: Session, restaurant_id: int, table_id: int, data: dict
) -> Order:
    """Place a new order from customer."""
    order = Order(
        restaurant_id=restaurant_id,
        table_id=table_id,
        order_number=_generate_order_number(),
        status=OrderStatus.placed,
        notes=data.get("notes"),
    )
    db.add(order)
    db.flush()

    total = 0.0
    for item_data in data["items"]:
        menu_item = db.query(MenuItem).get(item_data["menu_item_id"])
        if not menu_item:
            continue
        oi = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            name=menu_item.name,
            price=menu_item.price,
            quantity=item_data["quantity"],
            notes=item_data.get("notes"),
        )
        total += menu_item.price * item_data["quantity"]
        db.add(oi)

    order.total_amount = round(total, 2)

    # Mark table as occupied
    table = db.query(RestaurantTable).get(table_id)
    if table:
        table.status = TableStatus.occupied

    db.commit()
    db.refresh(order)
    logger.info("Order placed: %s table_id=%d", order.order_number, table_id)
    return order


def get_orders_by_restaurant(
    db: Session, restaurant_id: int, status: str | None = None
) -> list[Order]:
    """Get orders for waiter/kitchen view."""
    q = (
        db.query(Order)
        .filter(Order.restaurant_id == restaurant_id)
        .options(joinedload(Order.items), joinedload(Order.table))
    )
    if status:
        q = q.filter(Order.status == OrderStatus(status))
    return q.order_by(Order.placed_at.desc()).all()


def get_active_orders(db: Session, restaurant_id: int) -> list[Order]:
    """Get non-served, non-cancelled orders."""
    return (
        db.query(Order)
        .filter(
            Order.restaurant_id == restaurant_id,
            Order.status.notin_([OrderStatus.served, OrderStatus.cancelled]),
        )
        .options(joinedload(Order.items), joinedload(Order.table))
        .order_by(Order.placed_at.asc())
        .all()
    )


def get_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .filter(Order.id == order_id)
        .options(joinedload(Order.items), joinedload(Order.table))
        .first()
    )


def get_orders_by_table_token(db: Session, qr_token: str) -> list[Order]:
    """Get active orders for a table (customer tracking)."""
    table = get_table_by_token(db, qr_token)
    if not table:
        return []
    return (
        db.query(Order)
        .filter(
            Order.table_id == table.id,
            Order.status.notin_([OrderStatus.served, OrderStatus.cancelled]),
        )
        .options(joinedload(Order.items))
        .order_by(Order.placed_at.desc())
        .all()
    )


def update_order_status(
    db: Session, order: Order, new_status: str
) -> Order:
    now = datetime.now(timezone.utc)
    order.status = OrderStatus(new_status)
    if new_status == "preparing":
        order.preparing_at = now
    elif new_status == "ready":
        order.ready_at = now
    elif new_status == "served":
        order.served_at = now
        # Free the table if no other active orders
        if order.table_id:
            active = (
                db.query(Order)
                .filter(
                    Order.table_id == order.table_id,
                    Order.id != order.id,
                    Order.status.notin_([OrderStatus.served, OrderStatus.cancelled]),
                )
                .count()
            )
            if active == 0:
                table = db.query(RestaurantTable).get(order.table_id)
                if table:
                    table.status = TableStatus.available
    db.commit()
    db.refresh(order)
    return order


def call_waiter_toggle(db: Session, order_id: int, value: bool) -> Order | None:
    order = db.query(Order).get(order_id)
    if order:
        order.call_waiter = value
        db.commit()
        db.refresh(order)
    return order


def request_bill_toggle(db: Session, order_id: int, value: bool) -> Order | None:
    order = db.query(Order).get(order_id)
    if order:
        order.request_bill = value
        db.commit()
        db.refresh(order)
    return order
