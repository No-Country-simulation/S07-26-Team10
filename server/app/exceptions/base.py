from typing import Any


class AppException(Exception):
    """
    Excepción base de la aplicación.

    Todas las excepciones personalizadas deben heredar de esta clase.
    """

    status_code: int = 500
    error: str = "Application Error"

    def __init__(
        self,
        message: str,
        *,
        details: Any | None = None,
    ) -> None:
        self.message = message
        self.details = details
        super().__init__(message)

    def to_dict(self) -> dict:
        return {
            "success": False,
            "error": self.error,
            "message": self.message,
            "details": self.details,
        }