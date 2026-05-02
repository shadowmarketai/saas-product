from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_superadmin, get_current_user
from app.database import get_db
from app.models.product import ProductTemplate, ProductType
from app.models.user import User
from app.schemas.product import TemplateResponse
from app.services import product_service

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateResponse])
async def list_templates(
    product_type: Optional[str] = None,
    industry: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[object]:
    return product_service.get_templates(db, product_type, industry, skip, limit)


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> object:
    template = product_service.get_template(db, template_id)
    if not template:
        raise HTTPException(404, "Template not found")
    return template


@router.post("/", response_model=TemplateResponse, status_code=201)
async def create_template(
    name: str,
    product_type: str,
    description: str = "",
    thumbnail_url: str = "",
    industry: str = "",
    style: str = "",
    is_premium: bool = False,
    config_json: dict = {},
    db: Session = Depends(get_db),
    _: User = Depends(get_current_superadmin),
) -> ProductTemplate:
    template = ProductTemplate(
        name=name,
        product_type=ProductType(product_type),
        description=description,
        thumbnail_url=thumbnail_url,
        industry=industry,
        style=style,
        is_premium=is_premium,
        config_json=config_json,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template
