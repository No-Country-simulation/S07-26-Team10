import uuid

from sqlalchemy.orm import Session

from app.modules.users.model import User
from app.modules.users.repository import UserRepository


class AuthRepository:
    """
    Repositorio de acceso a datos para autenticación.

    Delega las consultas de usuario a UserRepository para evitar
    duplicación de lógica de acceso a datos.
    """

    def __init__(self, db: Session) -> None:
        self.db = db
        self._user_repository = UserRepository(db)

    def get_user_by_email(self, email: str) -> User | None:
        """Obtiene un usuario por su email, incluyendo su rol."""

        return self._user_repository.get_by_email(email)

    def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        """Obtiene un usuario por su ID, incluyendo su rol."""

        return self._user_repository.get_by_id(user_id)
