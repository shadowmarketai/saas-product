import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.google import get_google_tokens, get_google_user
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import (
    GoogleAuthRequest,
    RefreshRequest,
    RegisterRequest,
    Token,
    UserResponse,
)
from app.services import tenant_service, user_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(req: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    if user_service.get_user_by_email(db, req.email):
        raise HTTPException(400, "Email already registered")

    tenant_id = None
    if req.tenant_slug:
        tenant = tenant_service.get_tenant_by_slug(db, req.tenant_slug)
        if not tenant:
            raise HTTPException(400, "Invalid franchise code")
        tenant_id = tenant.id

    token = secrets.token_urlsafe(32)
    user = user_service.create_user(
        db=db,
        email=req.email,
        password=req.password,
        full_name=req.full_name,
        phone=req.phone,
        role=UserRole.customer,
        tenant_id=tenant_id,
    )
    user.verification_token = token
    db.commit()
    db.refresh(user)

    resp = UserResponse.model_validate(user)
    resp.verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    return resp.model_dump()


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> dict:
    user = user_service.get_user_by_email(db, form.username)
    if not user or not user.hashed_password:
        raise HTTPException(401, "Invalid credentials")
    if not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(403, "Account is deactivated")

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)) -> dict:
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")

    user = db.query(User).filter(User.id == int(payload.get("sub", 0))).first()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found")

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/verify/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(404, "Invalid or expired verification token")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/google", response_model=Token)
async def google_auth(
    req: GoogleAuthRequest, db: Session = Depends(get_db)
) -> dict:
    tokens = await get_google_tokens(req.code)
    if "error" in tokens:
        raise HTTPException(400, "Google authentication failed")

    google_user = await get_google_user(tokens["access_token"])
    email = google_user.get("email")
    if not email:
        raise HTTPException(400, "Could not get email from Google")

    user = user_service.get_user_by_email(db, email)
    if not user:
        tenant_id = None
        if req.tenant_slug:
            tenant = tenant_service.get_tenant_by_slug(db, req.tenant_slug)
            if tenant:
                tenant_id = tenant.id

        user = User(
            email=email,
            full_name=google_user.get("name"),
            google_id=google_user.get("id"),
            avatar_url=google_user.get("picture"),
            is_verified=True,
            role=UserRole.customer,
            tenant_id=tenant_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }
