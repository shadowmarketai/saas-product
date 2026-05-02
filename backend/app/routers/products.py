from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    req: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    if current_user.role == UserRole.customer:
        raise HTTPException(403, "Customers cannot create products directly")

    tenant_id = current_user.tenant_id
    return product_service.create_product(
        db=db,
        product_type=req.product_type,
        name=req.name,
        customer_id=req.customer_id,
        created_by_id=current_user.id,
        tenant_id=tenant_id,
        config_data=req.config_data,
        template_id=req.template_id,
        slug=req.slug,
    )


@router.get("/", response_model=list[ProductResponse])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    product_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[object]:
    from app.models.product import ProductType

    pt = ProductType(product_type) if product_type else None

    if current_user.role == UserRole.customer:
        return product_service.get_products(
            db, skip, limit, customer_id=current_user.id, product_type=pt
        )
    elif current_user.role == UserRole.franchise_owner:
        return product_service.get_products(
            db, skip, limit, tenant_id=current_user.tenant_id, product_type=pt
        )
    return product_service.get_products(db, skip, limit, product_type=pt)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    if current_user.role == UserRole.customer and product.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")
    if (
        current_user.role == UserRole.franchise_owner
        and product.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(403, "Access denied")

    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    req: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    if current_user.role == UserRole.customer and product.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")
    if (
        current_user.role == UserRole.franchise_owner
        and product.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(403, "Access denied")

    return product_service.update_product(
        db, product, name=req.name, config_data=req.config_data
    )


@router.patch("/{product_id}", response_model=ProductResponse)
async def patch_product(
    product_id: int,
    req: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    if current_user.role == UserRole.customer and product.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")
    if (
        current_user.role == UserRole.franchise_owner
        and product.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(403, "Access denied")

    return product_service.update_product(
        db, product, name=req.name, config_data=req.config_data, is_published=req.is_published
    )


@router.patch("/{product_id}/publish", response_model=ProductResponse)
async def publish_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    if current_user.role == UserRole.customer and product.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")
    if (
        current_user.role == UserRole.franchise_owner
        and product.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(403, "Access denied")

    return product_service.update_product(db, product, is_published=True)


@router.patch("/{product_id}/unpublish", response_model=ProductResponse)
async def unpublish_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    if current_user.role == UserRole.customer and product.customer_id != current_user.id:
        raise HTTPException(403, "Access denied")
    if (
        current_user.role == UserRole.franchise_owner
        and product.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(403, "Access denied")

    return product_service.update_product(db, product, is_published=False)


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if current_user.role == UserRole.customer:
        raise HTTPException(403, "Access denied")

    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    if (
        current_user.role == UserRole.franchise_owner
        and product.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(403, "Access denied")

    product_service.update_product(db, product, is_active=False)
    return {"message": "Product deleted successfully"}
