from .base import AppException


class BusinessValidationException(AppException):
    status_code = 422
    error = "Business Validation Error"