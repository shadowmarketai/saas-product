"""Tests for /api/v1/vcards/* endpoints."""
import pytest


VCARD_PAYLOAD = {
    "name": "John Doe",
    "title": "Software Engineer",
    "company": "Acme Corp",
    "phone": "+91-9876543210",
    "email": "john@acme.com",
    "website": "https://johndoe.dev",
}


class TestCreateVCard:
    def test_create_vcard_success(self, client, customer_token):
        resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "John Doe"
        assert data["title"] == "Software Engineer"
        assert data["company"] == "Acme Corp"
        assert "slug" in data
        assert data["status"] == "draft"

    def test_create_vcard_requires_auth(self, client):
        resp = client.post("/api/v1/vcards/", json=VCARD_PAYLOAD)
        assert resp.status_code == 401

    def test_create_vcard_name_required(self, client, customer_token):
        resp = client.post(
            "/api/v1/vcards/",
            json={"title": "Engineer"},
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 422


class TestListVCards:
    def test_list_own_vcards(self, client, customer_token):
        # Create two cards
        for i in range(2):
            client.post(
                "/api/v1/vcards/",
                json={**VCARD_PAYLOAD, "name": f"Card {i}"},
                headers={"Authorization": f"Bearer {customer_token}"},
            )
        resp = client.get(
            "/api/v1/vcards/",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 2

    def test_list_vcards_requires_auth(self, client):
        resp = client.get("/api/v1/vcards/")
        assert resp.status_code == 401

    def test_users_cannot_see_each_others_cards(self, client, customer_token, db):
        """Two different customers should only see their own cards."""
        from app.services.user_service import create_user
        from app.models.user import UserRole

        # Create a second customer and log in
        create_user(db, "customer2@test.com", "Pass@1234", "Customer Two", UserRole.customer)
        login_resp = client.post(
            "/api/v1/auth/login",
            data={"username": "customer2@test.com", "password": "Pass@1234"},
        )
        token2 = login_resp.json()["access_token"]

        # customer_token creates a card
        client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )

        # customer2 should see 0 cards
        resp = client.get("/api/v1/vcards/", headers={"Authorization": f"Bearer {token2}"})
        assert resp.status_code == 200
        assert len(resp.json()) == 0


class TestGetVCard:
    def test_get_vcard_by_id(self, client, customer_token):
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        vcard_id = create_resp.json()["id"]

        resp = client.get(
            f"/api/v1/vcards/{vcard_id}",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["id"] == vcard_id

    def test_get_nonexistent_vcard(self, client, customer_token):
        resp = client.get(
            "/api/v1/vcards/99999",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 404

    def test_get_other_users_vcard_denied(self, client, customer_token, db):
        from app.services.user_service import create_user
        from app.models.user import UserRole

        create_user(db, "other@test.com", "Pass@1234", "Other User", UserRole.customer)
        login_resp = client.post(
            "/api/v1/auth/login",
            data={"username": "other@test.com", "password": "Pass@1234"},
        )
        other_token = login_resp.json()["access_token"]

        # customer_token creates a card
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        vcard_id = create_resp.json()["id"]

        # other user cannot access it
        resp = client.get(
            f"/api/v1/vcards/{vcard_id}",
            headers={"Authorization": f"Bearer {other_token}"},
        )
        assert resp.status_code == 404


class TestPublishVCard:
    def test_publish_vcard(self, client, customer_token):
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        vcard_id = create_resp.json()["id"]
        assert create_resp.json()["status"] == "draft"

        resp = client.post(
            f"/api/v1/vcards/{vcard_id}/publish",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "published"

    def test_publish_nonexistent_vcard(self, client, customer_token):
        resp = client.post(
            "/api/v1/vcards/99999/publish",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 404


class TestPublicVCard:
    def test_get_public_vcard(self, client, customer_token):
        # Create and publish a card
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        vcard_id = create_resp.json()["id"]
        slug = create_resp.json()["slug"]

        client.post(
            f"/api/v1/vcards/{vcard_id}/publish",
            headers={"Authorization": f"Bearer {customer_token}"},
        )

        # Public endpoint — no auth needed
        resp = client.get(f"/api/v1/vcards/public/{slug}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "John Doe"
        assert "user_id" not in data

    def test_draft_vcard_not_accessible_publicly(self, client, customer_token):
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        slug = create_resp.json()["slug"]
        # Not published yet
        resp = client.get(f"/api/v1/vcards/public/{slug}")
        assert resp.status_code == 404

    def test_public_vcard_increments_view_count(self, client, customer_token):
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        vcard_id = create_resp.json()["id"]
        slug = create_resp.json()["slug"]

        client.post(
            f"/api/v1/vcards/{vcard_id}/publish",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        # View it twice
        client.get(f"/api/v1/vcards/public/{slug}")
        client.get(f"/api/v1/vcards/public/{slug}")

        # Check via authenticated endpoint
        card_resp = client.get(
            f"/api/v1/vcards/{vcard_id}",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert card_resp.json()["view_count"] == 2

    def test_nonexistent_slug_returns_404(self, client):
        resp = client.get("/api/v1/vcards/public/no-such-slug-xyz")
        assert resp.status_code == 404


class TestDeleteVCard:
    def test_delete_own_vcard(self, client, customer_token):
        create_resp = client.post(
            "/api/v1/vcards/",
            json=VCARD_PAYLOAD,
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        vcard_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/v1/vcards/{vcard_id}",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 204

        # Should not be accessible after delete
        get_resp = client.get(
            f"/api/v1/vcards/{vcard_id}",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert get_resp.status_code == 404

    def test_delete_nonexistent_vcard(self, client, customer_token):
        resp = client.delete(
            "/api/v1/vcards/99999",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 404

    def test_delete_requires_auth(self, client):
        resp = client.delete("/api/v1/vcards/1")
        assert resp.status_code == 401
