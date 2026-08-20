from .base import AppException
from app.core.constants import HTTP_500_INTERNAL_SERVER_ERROR

class DatabaseException(AppException):
    status_code = HTTP_500_INTERNAL_SERVER_ERROR
    error = "Database Error"