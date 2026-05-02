"""VCard service layer."""

import logging
import re
import secrets
from typing import Optional

from sqlalchemy.orm import Session

from app.models.vcard import VCard, VCardStatus

logger = logging.getLogger(__name__)


def _generate_slug(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40]
    suffix = secrets.token_hex(4)
    return f"{base}-{suffix}"


def create_vcard(
    db: Session,
    user_id: int,
    tenant_id: Optional[int],
    data: dict,
) -> VCard:
    slug = _generate_slug(data.get("name", "card"))
    vcard = VCard(
        user_id=user_id,
        tenant_id=tenant_id,
        slug=slug,
        **data,
    )
    db.add(vcard)
    db.commit()
    db.refresh(vcard)
    logger.info("VCard created: id=%s slug=%s user=%s", vcard.id, slug, user_id)
    return vcard


def get_vcard(db: Session, vcard_id: int) -> Optional[VCard]:
    return (
        db.query(VCard)
        .filter(VCard.id == vcard_id, VCard.is_deleted.is_(False))
        .first()
    )


def get_vcard_by_slug(db: Session, slug: str) -> Optional[VCard]:
    return (
        db.query(VCard)
        .filter(VCard.slug == slug, VCard.is_deleted.is_(False))
        .first()
    )


def get_vcards_by_user(db: Session, user_id: int) -> list[VCard]:
    return (
        db.query(VCard)
        .filter(VCard.user_id == user_id, VCard.is_deleted.is_(False))
        .order_by(VCard.created_at.desc())
        .all()
    )


def update_vcard(db: Session, vcard: VCard, data: dict) -> VCard:
    for key, value in data.items():
        if value is not None:
            setattr(vcard, key, value)
    db.commit()
    db.refresh(vcard)
    logger.info("VCard updated: id=%s", vcard.id)
    return vcard


def publish_vcard(db: Session, vcard: VCard) -> VCard:
    vcard.status = VCardStatus.published
    db.commit()
    db.refresh(vcard)
    return vcard


def archive_vcard(db: Session, vcard: VCard) -> VCard:
    vcard.status = VCardStatus.archived
    db.commit()
    db.refresh(vcard)
    return vcard


def soft_delete_vcard(db: Session, vcard: VCard) -> None:
    vcard.is_deleted = True
    db.commit()
    logger.info("VCard soft-deleted: id=%s", vcard.id)


def increment_view(db: Session, vcard: VCard) -> None:
    vcard.view_count = (vcard.view_count or 0) + 1
    db.commit()


def increment_click(db: Session, vcard: VCard) -> None:
    vcard.click_count = (vcard.click_count or 0) + 1
    db.commit()


def increment_share(db: Session, vcard: VCard) -> None:
    vcard.share_count = (vcard.share_count or 0) + 1
    db.commit()


def generate_vcf(vcard: VCard) -> str:
    """Generate a vCard 3.0 (.vcf) string."""
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{vcard.name}",
    ]
    if vcard.title and vcard.company:
        lines.append(f"TITLE:{vcard.title}")
        lines.append(f"ORG:{vcard.company}")
    elif vcard.title:
        lines.append(f"TITLE:{vcard.title}")
    elif vcard.company:
        lines.append(f"ORG:{vcard.company}")
    if vcard.phone:
        lines.append(f"TEL;TYPE=CELL:{vcard.phone}")
    if vcard.email:
        lines.append(f"EMAIL:{vcard.email}")
    if vcard.website:
        lines.append(f"URL:{vcard.website}")
    if vcard.address:
        lines.append(f"ADR;TYPE=WORK:;;{vcard.address};;;;")
    if vcard.linkedin:
        lines.append(f"X-SOCIALPROFILE;TYPE=linkedin:{vcard.linkedin}")
    if vcard.instagram:
        lines.append(f"X-SOCIALPROFILE;TYPE=instagram:{vcard.instagram}")
    if vcard.github:
        lines.append(f"X-SOCIALPROFILE;TYPE=github:{vcard.github}")
    if vcard.twitter:
        lines.append(f"X-SOCIALPROFILE;TYPE=twitter:{vcard.twitter}")
    if vcard.profile_image_url:
        lines.append(f"PHOTO;VALUE=URI:{vcard.profile_image_url}")
    if vcard.bio:
        lines.append(f"NOTE:{vcard.bio[:250]}")
    lines.append("END:VCARD")
    return "\r\n".join(lines)
