from .base import AppException


class NotFoundException(AppException):
    status_code = 404
    error = "Not Found"