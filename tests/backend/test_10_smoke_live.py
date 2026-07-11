"""Optional live-server smoke tests.

Run only when the API is already running:
  set POPY_API_URL=http://localhost:8000
  pytest backend/test_10_smoke_live.py -m smoke
"""

import os

import pytest
import requests

API_URL = os.environ.get("POPY_API_URL", "http://localhost:8000")


def _server_available() -> bool:
    try:
        response = requests.get(f"{API_URL}/admin/login/", timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False


pytestmark = pytest.mark.smoke


@pytest.mark.skipif(not _server_available(), reason="API server is not running")
class TestLiveSmoke:
    def test_admin_login_page_loads(self):
        response = requests.get(f"{API_URL}/admin/login/", timeout=5)
        assert response.status_code == 200
        assert "Popy POS" in response.text or "login" in response.text.lower()

    def test_auth_login_endpoint_rejects_bad_credentials(self):
        response = requests.post(
            f"{API_URL}/api/auth/login",
            json={"email": "nobody@test.com", "password": "wrong"},
            timeout=5,
        )
        assert response.status_code == 401
