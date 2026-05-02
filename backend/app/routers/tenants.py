from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_superadmin
from app.database import get_db
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.tenant import TenantCreate, TenantResponse, TenantUpdate
from app.services import tenant_service

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("/", response_model=TenantResponse, status_code=201)
async def create_tenant(
    req: TenantCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> object:
    if tenant_service.get_tenant_by_slug(db, req.slug):
        raise HTTPException(400, "Slug already taken")

    return tenant_service.create_tenant(
        db=db,
        name=req.name,
        slug=req.slug,
        owner_email=req.owner_email,
        owner_name=req.owner_name,
        owner_password=req.owner_password,
        subdomain=req.subdomain,
        custom_domain=req.custom_domain,
        logo_url=req.logo_url,
        brand_color_primary=req.brand_color_primary,
        brand_color_secondary=req.brand_color_secondary,
    )


@router.get("/", response_model=list[TenantResponse])
async def list_tenants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> list[object]:
    return tenant_service.get_tenants(db, skip, limit)


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> object:
    tenant = tenant_service.get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(404, "Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    req: TenantUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> object:
    tenant = tenant_service.get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(404, "Tenant not found")
    return tenant_service.update_tenant(
        db,
        tenant,
        name=req.name,
        subdomain=req.subdomain,
        custom_domain=req.custom_domain,
        logo_url=req.logo_url,
        brand_color_primary=req.brand_color_primary,
        brand_color_secondary=req.brand_color_secondary,
        tier=req.tier,
    )


@router.patch("/{tenant_id}/activate", response_model=MessageResponse)
async def activate_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> dict:
    tenant = tenant_service.get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(404, "Tenant not found")
    tenant_service.activate_tenant(db, tenant)
    return {"message": f"Tenant {tenant.name} activated"}


@router.patch("/{tenant_id}/deactivate", response_model=MessageResponse)
async def deactivate_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> dict:
    tenant = tenant_service.get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(404, "Tenant not found")
    tenant_service.deactivate_tenant(db, tenant)
    return {"message": f"Tenant {tenant.name} deactivated"}
