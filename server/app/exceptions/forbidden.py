from .base import AppException


class ForbiddenException(AppException):
    status_code = 403
    error = "Forbidden"