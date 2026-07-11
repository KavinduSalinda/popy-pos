class StripApiTrailingSlashMiddleware:
    """Normalize /api/.../ paths so slash and slashless URLs both match DRF routes."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        if path.startswith("/api/") and path.endswith("/") and path != "/api/":
            request.path_info = path.rstrip("/")
            request.path = request.path_info
        return self.get_response(request)
