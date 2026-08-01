from .base import AppException
from app.core.constants import HTTP_401_UNAUTHORIZED

class UnauthorizedException(AppException):
    status_code = HTTP_401_UNAUTHORIZED
    error = "Unauthorized"