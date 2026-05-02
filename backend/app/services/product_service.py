import logging
import re
from typing import Optional

from sqlalchemy.orm import Session

from app.models.product import Product, ProductTemplate, ProductType

logger = logging.getLogger(__name__)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)


def get_product(db: Session, product_id: int) -> Optional[Product]:
    return (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_active.is_(True))
        .first()
    )


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    tenant_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    product_type: Optional[ProductType] = None,
) -> list[Product]:
    query = db.query(Product).filter(Product.is_active.is_(True))
    if tenant_id:
        query = query.filter(Product.tenant_id == tenant_id)
    if customer_id:
        query = query.filter(Product.customer_id == customer_id)
    if product_type:
        query = query.filter(Product.product_type == product_type)
    return query.offset(skip).limit(limit).all()


def count_products(
    db: Session,
    tenant_id: Optional[int] = None,
    customer_id: Optional[int] = None,
) -> int:
    query = db.query(Product).filter(Product.is_active.is_(True))
    if tenant_id:
        query = query.filter(Product.tenant_id == tenant_id)
    if customer_id:
        query = query.filter(Product.customer_id == customer_id)
    return query.count()


def create_product(
    db: Session,
    product_type: str,
    name: str,
    customer_id: int,
    created_by_id: int,
    tenant_id: Optional[int] = None,
    config_data: Optional[dict] = None,
    template_id: Optional[int] = None,
    slug: Optional[str] = None,
) -> Product:
    product = Product(
        product_type=ProductType(product_type),
        name=name,
        slug=slug or slugify(name),
        config_data=config_data or {},
        template_id=template_id,
        customer_id=customer_id,
        tenant_id=tenant_id,
        created_by_id=created_by_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    logger.info("Created product %s for customer %d", name, customer_id)
    return product


def update_product(db: Session, product: Product, **kwargs: object) -> Product:
    for key, value in kwargs.items():
        if value is not None and hasattr(product, key):
            setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def get_templates(
    db: Session,
    product_type: Optional[str] = None,
    industry: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> list[ProductTemplate]:
    query = db.query(ProductTemplate)
    if product_type:
        query = query.filter(ProductTemplate.product_type == ProductType(product_type))
    if industry:
        query = query.filter(ProductTemplate.industry == industry)
    return query.offset(skip).limit(limit).all()


def get_template(db: Session, template_id: int) -> Optional[ProductTemplate]:
    return db.query(ProductTemplate).filter(ProductTemplate.id == template_id).first()
