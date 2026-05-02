"""MiniSite API router — CRUD + public endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.minisite import MiniSiteStatus
from app.models.user import User
from app.schemas.minisite import (
    MiniSiteCreateRequest,
    MiniSitePublicResponse,
    MiniSiteResponse,
    MiniSiteUpdateRequest,
)
from app.services import minisite_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/minisites", tags=["minisites"])


@router.get("/", response_model=list[MiniSiteResponse])
async def list_minisites(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list:
    return minisite_service.get_minisites_by_user(db, user.id)


@router.post("/", response_model=MiniSiteResponse, status_code=201)
async def create_minisite(
    req: MiniSiteCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    data = req.model_dump(exclude_none=True)
    return minisite_service.create_minisite(
        db, user_id=user.id, tenant_id=user.tenant_id, data=data
    )


@router.get("/{site_id}", response_model=MiniSiteResponse)
async def get_minisite(
    site_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    site = minisite_service.get_minisite(db, site_id)
    if not site or site.user_id != user.id:
        raise HTTPException(404, "Site not found")
    return site


@router.put("/{site_id}", response_model=MiniSiteResponse)
async def update_minisite(
    site_id: int,
    req: MiniSiteUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    site = minisite_service.get_minisite(db, site_id)
    if not site or site.user_id != user.id:
        raise HTTPException(404, "Site not found")
    data = req.model_dump(exclude_none=True)
    return minisite_service.update_minisite(db, site, data)


@router.post("/{site_id}/publish", response_model=MiniSiteResponse)
async def publish_minisite(
    site_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    site = minisite_service.get_minisite(db, site_id)
    if not site or site.user_id != user.id:
        raise HTTPException(404, "Site not found")
    return minisite_service.publish_minisite(db, site)


@router.post("/{site_id}/archive", response_model=MiniSiteResponse)
async def archive_minisite(
    site_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    site = minisite_service.get_minisite(db, site_id)
    if not site or site.user_id != user.id:
        raise HTTPException(404, "Site not found")
    return minisite_service.archive_minisite(db, site)


@router.delete("/{site_id}", status_code=204)
async def delete_minisite(
    site_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    site = minisite_service.get_minisite(db, site_id)
    if not site or site.user_id != user.id:
        raise HTTPException(404, "Site not found")
    minisite_service.soft_delete_minisite(db, site)


# ── Public endpoints ────────────────────────────────────────────────

@router.get("/public/{slug}", response_model=MiniSitePublicResponse)
async def get_public_minisite(
    slug: str, db: Session = Depends(get_db)
) -> dict:
    site = minisite_service.get_minisite_by_slug(db, slug)
    if not site or site.status != MiniSiteStatus.published:
        raise HTTPException(404, "Site not found")
    minisite_service.increment_view(db, site)
    return site
