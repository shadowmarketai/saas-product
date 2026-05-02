from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload.get("sub", 0))).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


async def get_current_active_user(
    user: User = Depends(get_current_user),
) -> User:
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return user


def require_role(roles: list[UserRole]) -> Callable:
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role {user.role.value} not authorized for this action",
            )
        return user

    return role_checker


async def get_current_superadmin(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user


async def get_current_franchise_owner(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != UserRole.franchise_owner:
        raise HTTPException(
            status_code=403, detail="Franchise owner access required"
        )
    return user
