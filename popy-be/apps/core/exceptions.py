from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    status_code = response.status_code
    data = response.data

    if isinstance(data, dict) and "detail" in data and len(data) == 1:
        message = str(data["detail"])
        errors = None
    elif isinstance(data, dict):
        message = "Validation error"
        errors = data
    elif isinstance(data, list):
        message = data[0] if data else "An error occurred"
        errors = None
    else:
        message = str(data)
        errors = None

    response.data = {
        "message": message,
        "statusCode": status_code,
    }
    if errors is not None:
        response.data["errors"] = errors

    return response


class POSAPIException(Exception):
    def __init__(self, message, status_code=status.HTTP_400_BAD_REQUEST, errors=None):
        self.message = message
        self.status_code = status_code
        self.errors = errors
