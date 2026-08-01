from .base import AppException


class ConflictException(AppException):
    status_code = 409
    error = "Conflict"