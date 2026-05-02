"""Public endpoints for viewing published products - no auth required."""
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.analytics import ProductAnalytics
from app.models.product import Product
from app.schemas.product import ProductResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/public", tags=["public"])


@router.get("/products/{slug}", response_model=ProductResponse)
async def view_product(
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
) -> Product:
    product = (
        db.query(Product)
        .filter(Product.slug == slug, Product.is_active.is_(True), Product.is_published.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(404, "Product not found")

    # Track view event
    event = ProductAnalytics(
        product_id=product.id,
        event_type="view",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    db.add(event)
    db.commit()

    return product


@router.post("/products/{slug}/track")
async def track_event(
    slug: str,
    event_type: str,
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    product = (
        db.query(Product)
        .filter(Product.slug == slug, Product.is_active.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(404, "Product not found")

    event = ProductAnalytics(
        product_id=product.id,
        event_type=event_type,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    db.add(event)
    db.commit()
    return {"tracked": True}
