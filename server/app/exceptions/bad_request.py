from .base import AppException


class BadRequestException(AppException):
    status_code = 400
    error = "Bad Request"