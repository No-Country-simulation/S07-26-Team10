from .base import AppException
from app.core.constants import HTTP_400_BAD_REQUEST

class BadRequestException(AppException):
    status_code = HTTP_400_BAD_REQUEST
    error = "Bad Request"