from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.analytics import ProductAnalytics
from app.models.product import Product
from app.models.user import User, UserRole

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/track", status_code=201)
async def track_event(
    product_id: int,
    event_type: str,
    request: Request,
    event_data: Optional[dict] = None,
    db: Session = Depends(get_db),
) -> dict:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    analytics = ProductAnalytics(
        product_id=product_id,
        event_type=event_type,
        event_data=event_data or {},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", ""),
    )
    db.add(analytics)
    db.commit()
    return {"message": "Event tracked"}


@router.get("/product/{product_id}")
async def get_product_analytics(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    if current_user.role == UserRole.customer and product.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")

    total_views = (
        db.query(func.count(ProductAnalytics.id))
        .filter(
            ProductAnalytics.product_id == product_id,
            ProductAnalytics.event_type == "view",
        )
        .scalar()
    )
    total_clicks = (
        db.query(func.count(ProductAnalytics.id))
        .filter(
            ProductAnalytics.product_id == product_id,
            ProductAnalytics.event_type == "click",
        )
        .scalar()
    )
    total_scans = (
        db.query(func.count(ProductAnalytics.id))
        .filter(
            ProductAnalytics.product_id == product_id,
            ProductAnalytics.event_type == "scan",
        )
        .scalar()
    )
    total_leads = (
        db.query(func.count(ProductAnalytics.id))
        .filter(
            ProductAnalytics.product_id == product_id,
            ProductAnalytics.event_type == "lead",
        )
        .scalar()
    )

    return {
        "product_id": product_id,
        "total_views": total_views,
        "total_clicks": total_clicks,
        "total_scans": total_scans,
        "total_leads": total_leads,
    }


@router.get("/dashboard")
async def dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    from app.models.subscription import Subscription, SubscriptionStatus
    from app.models.tenant import Tenant

    if current_user.role == UserRole.super_admin:
        total_tenants = db.query(func.count(Tenant.id)).scalar()
        total_products = db.query(func.count(Product.id)).filter(Product.is_active.is_(True)).scalar()
        total_active_subs = (
            db.query(func.count(Subscription.id))
            .filter(Subscription.status == SubscriptionStatus.active)
            .scalar()
        )
        return {
            "total_franchises": total_tenants,
            "total_products": total_products,
            "active_subscriptions": total_active_subs,
        }

    elif current_user.role == UserRole.franchise_owner:
        tenant_id = current_user.tenant_id
        total_products = (
            db.query(func.count(Product.id))
            .filter(Product.tenant_id == tenant_id, Product.is_active.is_(True))
            .scalar()
        )
        total_customers = (
            db.query(func.count(User.id))
            .filter(User.tenant_id == tenant_id, User.role == UserRole.customer)
            .scalar()
        )
        return {
            "total_products": total_products,
            "total_customers": total_customers,
        }

    else:
        total_products = (
            db.query(func.count(Product.id))
            .filter(Product.customer_id == current_user.id, Product.is_active.is_(True))
            .scalar()
        )
        return {"total_products": total_products}
