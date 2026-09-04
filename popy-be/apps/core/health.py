from django.http import JsonResponse
from django.db import connection
from django.views import View


class HealthView(View):
    """Unauthenticated liveness/readiness probe for deploy and Docker healthchecks."""

    def get(self, request):
        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False

        status = 200 if db_ok else 503
        return JsonResponse(
            {
                "status": "ok" if db_ok else "degraded",
                "database": "up" if db_ok else "down",
            },
            status=status,
        )
