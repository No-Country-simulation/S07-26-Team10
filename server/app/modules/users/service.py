import uuid

from app.core.security import hash_password
from app.exceptions import ConflictException, NotFoundException
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate, UserRead, UserUpdate


class UserService:
    """
    Servicio de lógica de negocio para usuarios.
    """

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository


    def get_user(self, user_id: uuid.UUID) -> UserRead:
        """
        Obtiene un usuario por su ID.
        """

        user = self.repository.get_by_id(user_id)

        if not user:
            raise NotFoundException(
                message="Usuario no encontrado.",
            )

        return UserRead.model_validate(user)


    def create_user(self, data: UserCreate) -> UserRead:
        """
        Crea un nuevo usuario administrador.

        Reglas:
        - El email debe ser único.
        - La contraseña se almacena como hash.
        """

        self._validate_email_unique(data.email)

        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password),
            is_active=data.is_active,
        )

        created_user = self.repository.create(user)

        return UserRead.model_validate(created_user)


    def update_user(
        self,
        user_id: uuid.UUID,
        data: UserUpdate,
    ) -> UserRead:
        """
        Actualiza parcialmente un usuario.

        Reglas:
        - El usuario debe existir.
        - El email debe mantenerse único.
        - La contraseña se vuelve a hashear si cambia.
        """

        user = self.repository.get_by_id(user_id)

        if not user:
            raise NotFoundException(
                message="Usuario no encontrado.",
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        if (
            "email" in update_data
            and update_data["email"] != user.email
        ):
            self._validate_email_unique(
                update_data["email"]
            )

        if "password" in update_data:
            update_data["password"] = hash_password(
                update_data["password"]
            )

        for field, value in update_data.items():
            setattr(user, field, value)

        updated_user = self.repository.update(user)

        return UserRead.model_validate(updated_user)


    def deactivate_user(
        self,
        user_id: uuid.UUID,
    ) -> UserRead:
        """
        Desactiva un usuario mediante is_active=False.
        """

        user = self.repository.get_by_id(user_id)

        if not user:
            raise NotFoundException(
                message="Usuario no encontrado.",
            )

        user.is_active = False

        updated_user = self.repository.update(user)

        return UserRead.model_validate(updated_user)


    def _validate_email_unique(
        self,
        email: str,
    ) -> None:
        """
        Verifica que el email no esté registrado.
        """

        existing = self.repository.get_by_email(email)

        if existing:
            raise ConflictException(
                message="El email ya está registrado.",
            )