from .base import AppException


class DatabaseException(AppException):
    status_code = 500
    error = "Database Error"