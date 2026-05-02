import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.auth.jwt import hash_password
from app.models.tenant import Tenant, FranchiseTier
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)


def get_tenant(db: Session, tenant_id: int) -> Optional[Tenant]:
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()


def get_tenant_by_slug(db: Session, slug: str) -> Optional[Tenant]:
    return db.query(Tenant).filter(Tenant.slug == slug).first()


def get_tenants(
    db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None
) -> list[Tenant]:
    query = db.query(Tenant)
    if is_active is not None:
        query = query.filter(Tenant.is_active == is_active)
    return query.offset(skip).limit(limit).all()


def count_tenants(db: Session, is_active: Optional[bool] = None) -> int:
    query = db.query(Tenant)
    if is_active is not None:
        query = query.filter(Tenant.is_active == is_active)
    return query.count()


def create_tenant(
    db: Session,
    name: str,
    slug: str,
    owner_email: str,
    owner_name: str,
    owner_password: str,
    subdomain: Optional[str] = None,
    custom_domain: Optional[str] = None,
    logo_url: Optional[str] = None,
    brand_color_primary: str = "#4F46E5",
    brand_color_secondary: str = "#F59E0B",
) -> Tenant:
    owner = User(
        email=owner_email,
        hashed_password=hash_password(owner_password),
        full_name=owner_name,
        role=UserRole.franchise_owner,
        is_active=True,
    )
    db.add(owner)
    db.flush()

    tenant = Tenant(
        name=name,
        slug=slug,
        subdomain=subdomain or slug,
        custom_domain=custom_domain,
        logo_url=logo_url,
        brand_color_primary=brand_color_primary,
        brand_color_secondary=brand_color_secondary,
        owner_id=owner.id,
    )
    db.add(tenant)
    db.flush()

    owner.tenant_id = tenant.id
    db.commit()
    db.refresh(tenant)
    logger.info("Created tenant %s with owner %s", name, owner_email)
    return tenant


def update_tenant(db: Session, tenant: Tenant, **kwargs: object) -> Tenant:
    for key, value in kwargs.items():
        if value is not None and hasattr(tenant, key):
            setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


def activate_tenant(db: Session, tenant: Tenant) -> Tenant:
    tenant.is_active = True
    db.commit()
    db.refresh(tenant)
    logger.info("Activated tenant %s", tenant.name)
    return tenant


def deactivate_tenant(db: Session, tenant: Tenant) -> Tenant:
    tenant.is_active = False
    db.commit()
    db.refresh(tenant)
    logger.info("Deactivated tenant %s", tenant.name)
    return tenant
