import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_health_endpoint_ok(api_client):
    url = reverse("api-health")
    response = api_client.get(url)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "up"
