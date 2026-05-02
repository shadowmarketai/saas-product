import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.exceptions import AppException
from app.middleware.tenant import TenantMiddleware
from app.routers import (
    ai,
    analytics,
    auth,
    commissions,
    notifications,
    products,
    public,
    subscriptions,
    support,
    templates,
    tenants,
    users,
    vcard,
    minisite,
    qrmenu,
    ws,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="All-in-One White Label SaaS Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TenantMiddleware)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(tenants.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(templates.router, prefix="/api/v1")
app.include_router(subscriptions.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(commissions.router, prefix="/api/v1")
app.include_router(support.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(public.router, prefix="/api/v1")
app.include_router(vcard.router, prefix="/api/v1")
app.include_router(minisite.router, prefix="/api/v1")
app.include_router(qrmenu.router, prefix="/api/v1")
app.include_router(ws.router)
app.include_router(ai.router, prefix="/api/v1")


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "healthy", "service": settings.APP_NAME}


@app.on_event("startup")
async def startup() -> None:
    logger.info("%s API started", settings.APP_NAME)
    if settings.SECRET_KEY == "change-me-in-production":
        logger.warning(
            "SECURITY WARNING: SECRET_KEY is using the default insecure value. "
            "Set a strong SECRET_KEY in your .env file before deploying to production."
        )
