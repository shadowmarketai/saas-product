import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.auth.jwt import hash_password
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id, User.is_deleted.is_(False)).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    tenant_id: Optional[int] = None,
) -> list[User]:
    query = db.query(User).filter(User.is_deleted.is_(False))
    if role:
        query = query.filter(User.role == role)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    return query.offset(skip).limit(limit).all()


def count_users(
    db: Session,
    role: Optional[UserRole] = None,
    tenant_id: Optional[int] = None,
) -> int:
    query = db.query(User).filter(User.is_deleted.is_(False))
    if role:
        query = query.filter(User.role == role)
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    return query.count()


def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    role: UserRole = UserRole.customer,
    phone: Optional[str] = None,
    tenant_id: Optional[int] = None,
) -> User:
    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=role,
        phone=phone,
        tenant_id=tenant_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Created user %s with role %s", email, role.value)
    return user


def update_user(
    db: Session,
    user: User,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> User:
    if full_name is not None:
        user.full_name = full_name
    if phone is not None:
        user.phone = phone
    if avatar_url is not None:
        user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    return user


def soft_delete_user(db: Session, user: User) -> User:
    user.is_deleted = True
    user.is_active = False
    db.commit()
    db.refresh(user)
    logger.info("Soft deleted user %s", user.email)
    return user
