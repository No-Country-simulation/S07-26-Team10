from .base import AppException
from app.core.constants import HTTP_422_UNPROCESSABLE_ENTITY

class BusinessValidationException(AppException):
    status_code = HTTP_422_UNPROCESSABLE_ENTITY
    error = "Business Validation Error"