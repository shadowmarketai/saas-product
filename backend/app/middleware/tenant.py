import logging
from typing import Optional

from fastapi import Request
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.database import SessionLocal
from app.models.tenant import Tenant

logger = logging.getLogger(__name__)


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        tenant_id = self._extract_tenant(request)
        request.state.tenant_id = tenant_id
        response = await call_next(request)
        return response

    def _extract_tenant(self, request: Request) -> Optional[int]:
        header_tenant = request.headers.get("X-Tenant-ID")
        if header_tenant:
            try:
                return int(header_tenant)
            except ValueError:
                logger.warning("Invalid X-Tenant-ID header value: %r", header_tenant)
                return None

        host = request.headers.get("host", "")
        subdomain = host.split(".")[0] if "." in host else None
        if subdomain and subdomain not in ("www", "api", "localhost"):
            db: Session = SessionLocal()
            try:
                tenant = (
                    db.query(Tenant)
                    .filter(Tenant.slug == subdomain, Tenant.is_active.is_(True))
                    .first()
                )
                if tenant:
                    return tenant.id
            finally:
                db.close()

        return None
