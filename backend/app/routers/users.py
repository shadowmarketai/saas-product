from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.auth import UserResponse, UserUpdateRequest
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[User]:
    role_filter: Optional[UserRole] = None
    if role:
        try:
            role_filter = UserRole(role)
        except ValueError:
            raise HTTPException(400, f"Invalid role '{role}'. Valid values: {[r.value for r in UserRole]}")
    tenant_id = None

    if current_user.role == UserRole.franchise_owner:
        tenant_id = current_user.tenant_id
        if role_filter is None:
            role_filter = UserRole.customer
    elif current_user.role == UserRole.customer:
        raise HTTPException(403, "Access denied")

    return user_service.get_users(db, skip, limit, role_filter, tenant_id)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    if current_user.role == UserRole.franchise_owner:
        if user.tenant_id != current_user.tenant_id:
            raise HTTPException(403, "Access denied")
    elif current_user.role == UserRole.customer:
        if user.id != current_user.id:
            raise HTTPException(403, "Access denied")

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    req: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    if current_user.role == UserRole.customer and user.id != current_user.id:
        raise HTTPException(403, "Access denied")
    if current_user.role == UserRole.franchise_owner:
        if user.tenant_id != current_user.tenant_id:
            raise HTTPException(403, "Access denied")

    return user_service.update_user(
        db, user, full_name=req.full_name, phone=req.phone, avatar_url=req.avatar_url
    )


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if current_user.role not in (UserRole.super_admin, UserRole.franchise_owner):
        raise HTTPException(403, "Access denied")

    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    if current_user.role == UserRole.franchise_owner:
        if user.tenant_id != current_user.tenant_id:
            raise HTTPException(403, "Access denied")

    user_service.soft_delete_user(db, user)
    return {"message": "User deleted successfully"}
