from .base import AppException
from app.core.constants import HTTP_403_FORBIDDEN

class ForbiddenException(AppException):
    status_code = HTTP_403_FORBIDDEN
    error = "Forbidden"