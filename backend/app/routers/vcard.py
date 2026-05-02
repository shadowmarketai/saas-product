"""VCard API router — CRUD + public endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.vcard import VCardStatus
from app.schemas.vcard import (
    VCardCreateRequest,
    VCardPublicResponse,
    VCardResponse,
    VCardUpdateRequest,
)
from app.services import vcard_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/vcards", tags=["vcards"])


# ── Authenticated CRUD ──────────────────────────────────────────────

@router.get("/", response_model=list[VCardResponse])
async def list_vcards(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list:
    return vcard_service.get_vcards_by_user(db, user.id)


@router.post("/", response_model=VCardResponse, status_code=201)
async def create_vcard(
    req: VCardCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    data = req.model_dump(exclude_none=True)
    card = vcard_service.create_vcard(
        db, user_id=user.id, tenant_id=user.tenant_id, data=data
    )
    return card


@router.get("/{vcard_id}", response_model=VCardResponse)
async def get_vcard(
    vcard_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    card = vcard_service.get_vcard(db, vcard_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404, "VCard not found")
    return card


@router.put("/{vcard_id}", response_model=VCardResponse)
async def update_vcard(
    vcard_id: int,
    req: VCardUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    card = vcard_service.get_vcard(db, vcard_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404, "VCard not found")
    data = req.model_dump(exclude_none=True)
    return vcard_service.update_vcard(db, card, data)


@router.post("/{vcard_id}/publish", response_model=VCardResponse)
async def publish_vcard(
    vcard_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    card = vcard_service.get_vcard(db, vcard_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404, "VCard not found")
    return vcard_service.publish_vcard(db, card)


@router.post("/{vcard_id}/archive", response_model=VCardResponse)
async def archive_vcard(
    vcard_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    card = vcard_service.get_vcard(db, vcard_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404, "VCard not found")
    return vcard_service.archive_vcard(db, card)


@router.delete("/{vcard_id}", status_code=204)
async def delete_vcard(
    vcard_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    card = vcard_service.get_vcard(db, vcard_id)
    if not card or card.user_id != user.id:
        raise HTTPException(404, "VCard not found")
    vcard_service.soft_delete_vcard(db, card)


# ── Public endpoints (no auth) ──────────────────────────────────────

@router.get("/public/{slug}", response_model=VCardPublicResponse)
async def get_public_vcard(slug: str, db: Session = Depends(get_db)) -> dict:
    card = vcard_service.get_vcard_by_slug(db, slug)
    if not card or card.status != VCardStatus.published:
        raise HTTPException(404, "Card not found")
    vcard_service.increment_view(db, card)
    return card


@router.post("/public/{slug}/click")
async def track_click(slug: str, db: Session = Depends(get_db)) -> dict:
    card = vcard_service.get_vcard_by_slug(db, slug)
    if not card:
        raise HTTPException(404, "Card not found")
    vcard_service.increment_click(db, card)
    return {"ok": True}


@router.post("/public/{slug}/share")
async def track_share(slug: str, db: Session = Depends(get_db)) -> dict:
    card = vcard_service.get_vcard_by_slug(db, slug)
    if not card:
        raise HTTPException(404, "Card not found")
    vcard_service.increment_share(db, card)
    return {"ok": True}


@router.get("/public/{slug}/vcf")
async def download_vcf(slug: str, db: Session = Depends(get_db)) -> PlainTextResponse:
    card = vcard_service.get_vcard_by_slug(db, slug)
    if not card or card.status != VCardStatus.published:
        raise HTTPException(404, "Card not found")
    vcf = vcard_service.generate_vcf(card)
    return PlainTextResponse(
        content=vcf,
        media_type="text/vcard",
        headers={"Content-Disposition": f'attachment; filename="{card.slug}.vcf"'},
    )
