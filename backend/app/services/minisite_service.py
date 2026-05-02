"""MiniSite service layer."""

import logging
import re
import secrets
from typing import Optional

from sqlalchemy.orm import Session

from app.models.minisite import MiniSite, MiniSiteStatus

logger = logging.getLogger(__name__)


def _generate_slug(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40]
    suffix = secrets.token_hex(4)
    return f"{base}-{suffix}"


def create_minisite(
    db: Session, user_id: int, tenant_id: Optional[int], data: dict
) -> MiniSite:
    slug = _generate_slug(data.get("site_name", "site"))
    site = MiniSite(user_id=user_id, tenant_id=tenant_id, slug=slug, **data)
    db.add(site)
    db.commit()
    db.refresh(site)
    logger.info("MiniSite created: id=%s slug=%s user=%s", site.id, slug, user_id)
    return site


def get_minisite(db: Session, site_id: int) -> Optional[MiniSite]:
    return (
        db.query(MiniSite)
        .filter(MiniSite.id == site_id, MiniSite.is_deleted.is_(False))
        .first()
    )


def get_minisite_by_slug(db: Session, slug: str) -> Optional[MiniSite]:
    return (
        db.query(MiniSite)
        .filter(MiniSite.slug == slug, MiniSite.is_deleted.is_(False))
        .first()
    )


def get_minisites_by_user(db: Session, user_id: int) -> list[MiniSite]:
    return (
        db.query(MiniSite)
        .filter(MiniSite.user_id == user_id, MiniSite.is_deleted.is_(False))
        .order_by(MiniSite.created_at.desc())
        .all()
    )


def update_minisite(db: Session, site: MiniSite, data: dict) -> MiniSite:
    for key, value in data.items():
        if value is not None:
            setattr(site, key, value)
    db.commit()
    db.refresh(site)
    logger.info("MiniSite updated: id=%s", site.id)
    return site


def publish_minisite(db: Session, site: MiniSite) -> MiniSite:
    site.status = MiniSiteStatus.published
    db.commit()
    db.refresh(site)
    return site


def archive_minisite(db: Session, site: MiniSite) -> MiniSite:
    site.status = MiniSiteStatus.archived
    db.commit()
    db.refresh(site)
    return site


def soft_delete_minisite(db: Session, site: MiniSite) -> None:
    site.is_deleted = True
    db.commit()
    logger.info("MiniSite soft-deleted: id=%s", site.id)


def increment_view(db: Session, site: MiniSite) -> None:
    site.view_count = (site.view_count or 0) + 1
    db.commit()
