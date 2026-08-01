from .base import AppException


class UnauthorizedException(AppException):
    status_code = 401
    error = "Unauthorized"