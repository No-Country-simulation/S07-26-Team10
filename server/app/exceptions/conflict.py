from .base import AppException
from app.core.constants import HTTP_409_CONFLICT

class ConflictException(AppException):
    status_code = HTTP_409_CONFLICT
    error = "Conflict"