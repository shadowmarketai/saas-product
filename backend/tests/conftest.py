"""
Test configuration and fixtures.

IMPORTANT: The JSONB/JSON SQLite compiler hooks MUST be registered before
any app.* imports so that create_all() works with SQLite.
"""
import os

# Override the database URL BEFORE any app imports touch config
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("TESTING", "true")

# Register SQLite compiler overrides for PostgreSQL-specific types
from sqlalchemy.dialects.postgresql import JSONB, JSON as PG_JSON  # noqa: E402
from sqlalchemy.ext.compiler import compiles  # noqa: E402
from sqlalchemy import JSON as SA_JSON  # noqa: E402


@compiles(JSONB, "sqlite")
def _compile_jsonb_sqlite(element, compiler, **kw):
    return "TEXT"


@compiles(PG_JSON, "sqlite")
def _compile_pgjson_sqlite(element, compiler, **kw):
    return "TEXT"


# Now safe to import app modules
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import (  # noqa: E402 — ensures all models are registered
    User, UserRole, Tenant, Product, VCard,
)

# Use a file-based SQLite so there are no cross-connection issues
TEST_DB_URL = "sqlite:///./test.db"

# Enable FK constraints for SQLite
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Patch TenantMiddleware's SessionLocal so it doesn't call Postgres
import app.middleware.tenant as _tenant_middleware  # noqa: E402
_tenant_middleware.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once per session; drop after all tests."""
    Base.metadata.create_all(bind=engine)
    yield
    # SQLite doesn't support ALTER, so we drop tables via raw SQL to avoid
    # circular FK teardown errors (tenants <-> users circular reference).
    with engine.connect() as conn:
        conn.execute(__import__("sqlalchemy").text("PRAGMA foreign_keys=OFF"))
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(__import__("sqlalchemy").text(f"DROP TABLE IF EXISTS [{table.name}]"))
        conn.execute(__import__("sqlalchemy").text("PRAGMA foreign_keys=ON"))
        conn.commit()
    # Remove the test DB file
    if os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture(autouse=True)
def clean_tables(setup_database):
    """Truncate all data between tests for isolation."""
    yield
    db = TestingSessionLocal()
    try:
        # Delete in FK-safe order
        db.execute(__import__("sqlalchemy").text("DELETE FROM vcards"))
        db.execute(__import__("sqlalchemy").text("DELETE FROM products"))
        db.execute(__import__("sqlalchemy").text("DELETE FROM users"))
        db.execute(__import__("sqlalchemy").text("DELETE FROM tenants"))
        db.commit()
    finally:
        db.close()


@pytest.fixture()
def db():
    """Provide a database session for direct DB manipulation in tests."""
    database = TestingSessionLocal()
    try:
        yield database
    finally:
        database.close()


@pytest.fixture()
def client():
    """FastAPI test client with DB override."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


def _register_user(client, email: str, password: str, full_name: str) -> dict:
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )
    assert resp.status_code == 201, f"Register failed: {resp.text}"
    return resp.json()


def _login(client, email: str, password: str) -> str:
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture()
def customer_token(client, db):
    """Register + login a customer user; return access token."""
    _register_user(client, "customer@test.com", "Pass@1234", "Test Customer")
    return _login(client, "customer@test.com", "Pass@1234")


@pytest.fixture()
def franchise_token(client, db):
    """Register a customer, promote to franchise_owner in DB, return token."""
    _register_user(client, "franchise@test.com", "Pass@1234", "Test Franchise")
    user = db.query(User).filter(User.email == "franchise@test.com").first()
    user.role = UserRole.franchise_owner
    db.commit()
    return _login(client, "franchise@test.com", "Pass@1234")


@pytest.fixture()
def admin_token(client, db):
    """Register a customer, promote to super_admin in DB, return token."""
    _register_user(client, "admin@test.com", "Pass@1234", "Test Admin")
    user = db.query(User).filter(User.email == "admin@test.com").first()
    user.role = UserRole.super_admin
    db.commit()
    return _login(client, "admin@test.com", "Pass@1234")
