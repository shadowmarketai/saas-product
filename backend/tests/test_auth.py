"""Tests for /api/v1/auth/* endpoints."""
import pytest


class TestRegister:
    def test_register_success(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "email": "new@example.com",
                "password": "SecurePass1!",
                "full_name": "New User",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["full_name"] == "New User"
        assert data["role"] == "customer"
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client):
        payload = {
            "email": "dup@example.com",
            "password": "SecurePass1!",
            "full_name": "First User",
        }
        r1 = client.post("/api/v1/auth/register", json=payload)
        assert r1.status_code == 201

        r2 = client.post("/api/v1/auth/register", json=payload)
        assert r2.status_code == 400
        assert "already registered" in r2.json()["detail"].lower()

    def test_register_missing_required_fields(self, client):
        resp = client.post(
            "/api/v1/auth/register",
            json={"email": "missing@example.com"},
        )
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"email": "login@example.com", "password": "Pass@1234", "full_name": "Login User"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "login@example.com", "password": "Pass@1234"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"email": "wrongpw@example.com", "password": "Pass@1234", "full_name": "User"},
        )
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "wrongpw@example.com", "password": "WrongPass"},
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "ghost@example.com", "password": "Pass@1234"},
        )
        assert resp.status_code == 401


class TestMe:
    def test_me_with_valid_token(self, client, customer_token):
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "customer@test.com"
        assert data["role"] == "customer"

    def test_me_without_token(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_me_with_invalid_token(self, client):
        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalidtoken123"},
        )
        assert resp.status_code == 401


class TestRefresh:
    def test_refresh_token_success(self, client):
        client.post(
            "/api/v1/auth/register",
            json={"email": "refresh@example.com", "password": "Pass@1234", "full_name": "Refresh User"},
        )
        login_resp = client.post(
            "/api/v1/auth/login",
            data={"username": "refresh@example.com", "password": "Pass@1234"},
        )
        refresh_token = login_resp.json()["refresh_token"]

        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_with_invalid_token(self, client):
        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "not-a-real-token"},
        )
        assert resp.status_code == 401

    def test_refresh_with_access_token_rejected(self, client, customer_token):
        """Access tokens must NOT be accepted as refresh tokens."""
        resp = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": customer_token},
        )
        assert resp.status_code == 401
