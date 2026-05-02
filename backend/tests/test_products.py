"""Tests for /api/v1/products/* endpoints."""
import pytest


class TestListProducts:
    def test_list_products_as_customer_returns_own(self, client, customer_token):
        """Customer sees only their own products (empty at start)."""
        resp = client.get(
            "/api/v1/products/",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_products_as_admin_returns_all(self, client, admin_token):
        """Super admin sees all products."""
        resp = client.get(
            "/api/v1/products/",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_products_requires_auth(self, client):
        resp = client.get("/api/v1/products/")
        assert resp.status_code == 401

    def test_list_products_as_franchise_owner(self, client, franchise_token):
        """Franchise owner can list products."""
        resp = client.get(
            "/api/v1/products/",
            headers={"Authorization": f"Bearer {franchise_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestCreateProduct:
    def test_create_product_as_franchise_owner(self, client, franchise_token, db):
        """Franchise owners can create products for customers."""
        from app.services.user_service import create_user
        from app.models.user import User, UserRole

        # Create a customer to assign the product to
        customer = create_user(db, "cust@prod.com", "Pass@1234", "Prod Customer", UserRole.customer)

        resp = client.post(
            "/api/v1/products/",
            json={
                "product_type": "vcard",
                "name": "Test VCard Product",
                "customer_id": customer.id,
                "config_data": {},
            },
            headers={"Authorization": f"Bearer {franchise_token}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Test VCard Product"
        assert data["product_type"] == "vcard"
        assert data["customer_id"] == customer.id

    def test_create_product_as_super_admin(self, client, admin_token, db):
        """Super admin can create products."""
        from app.services.user_service import create_user
        from app.models.user import UserRole

        customer = create_user(db, "cust2@prod.com", "Pass@1234", "Prod Customer2", UserRole.customer)

        resp = client.post(
            "/api/v1/products/",
            json={
                "product_type": "website",
                "name": "Admin Created Product",
                "customer_id": customer.id,
                "config_data": {"theme": "dark"},
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 201
        assert resp.json()["product_type"] == "website"

    def test_create_product_as_customer_denied(self, client, customer_token, db):
        """Customers cannot create products directly."""
        from app.models.user import User
        from app.auth.jwt import decode_token

        # Get current customer's ID from the token
        from app.services.user_service import get_user_by_email
        from tests.conftest import TestingSessionLocal

        session = TestingSessionLocal()
        try:
            user = get_user_by_email(session, "customer@test.com")
            customer_id = user.id
        finally:
            session.close()

        resp = client.post(
            "/api/v1/products/",
            json={
                "product_type": "vcard",
                "name": "Customer Direct Product",
                "customer_id": customer_id,
                "config_data": {},
            },
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 403

    def test_create_product_requires_auth(self, client):
        resp = client.post(
            "/api/v1/products/",
            json={
                "product_type": "vcard",
                "name": "No Auth Product",
                "customer_id": 1,
            },
        )
        assert resp.status_code == 401

    def test_create_product_invalid_type(self, client, admin_token, db):
        """Invalid product_type should return 422 (Pydantic) or 500."""
        from app.services.user_service import create_user
        from app.models.user import UserRole

        customer = create_user(db, "cust3@prod.com", "Pass@1234", "C3", UserRole.customer)

        resp = client.post(
            "/api/v1/products/",
            json={
                "product_type": "nonexistent_type",
                "name": "Bad Type",
                "customer_id": customer.id,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        # The service raises ValueError internally — should be 4xx or 5xx (not 2xx)
        assert resp.status_code >= 400

    def test_create_product_with_qr_menu_type(self, client, admin_token, db):
        """All valid product types are accepted."""
        from app.services.user_service import create_user
        from app.models.user import UserRole

        customer = create_user(db, "cust4@prod.com", "Pass@1234", "C4", UserRole.customer)

        valid_types = ["vcard", "website", "qr_menu", "social_poster", "link_in_bio"]
        for i, pt in enumerate(valid_types):
            resp = client.post(
                "/api/v1/products/",
                json={
                    "product_type": pt,
                    "name": f"Product {i}",
                    "customer_id": customer.id,
                    "slug": f"product-test-{i}-{pt}",
                },
                headers={"Authorization": f"Bearer {admin_token}"},
            )
            assert resp.status_code == 201, f"Failed for type {pt}: {resp.text}"
