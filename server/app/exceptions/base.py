class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int,
        error_code: str,
        details: dict | None = None,
    ):
        ...