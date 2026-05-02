"""File upload and QR code generation endpoints."""
import io
import logging
import os
import uuid

import qrcode
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.auth.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Upload an image (JPEG, PNG, WebP, GIF — max 5 MB). Returns the served URL."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, WebP, GIF allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "File too large (max 5 MB)")

    ext = (
        file.filename.rsplit(".", 1)[-1].lower()
        if file.filename and "." in file.filename
        else "jpg"
    )
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    logger.info("Image uploaded by user %s: %s", current_user.id, filename)
    return {"url": f"/uploads/{filename}", "filename": filename}


@router.get("/qr")
async def generate_qr(url: str, size: int = 10) -> StreamingResponse:
    """Generate a QR code PNG for any URL. No auth required — cacheable public endpoint."""
    qr = qrcode.QRCode(version=1, box_size=min(size, 20), border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )
