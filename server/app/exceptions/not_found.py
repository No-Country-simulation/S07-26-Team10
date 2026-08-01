from .base import AppException
from app.core.constants import HTTP_404_NOT_FOUND

class NotFoundException(AppException):
    status_code = HTTP_404_NOT_FOUND
    error = "Not Found"