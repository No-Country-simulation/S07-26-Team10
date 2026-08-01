import uuid

from app.core.security import hash_password
from app.exceptions import ConflictException, NotFoundException
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate, UserRead, UserUpdate


class UserService:
    """Servicio de lógica de negocio para usuarios."""

    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    def list_users(self) -> list[UserRead]:
        """Obtiene el listado completo de usuarios."""

        users = self.repository.get_all()
        return [UserRead.model_validate(u) for u in users]

    def get_user(self, user_id: uuid.UUID) -> UserRead:
        """Obtiene un usuario por su ID."""

        user = self.repository.get_by_id(user_id)

        if not user:
            raise NotFoundException(
                message="Usuario no encontrado.",
            )

        return UserRead.model_validate(user)

    def create_user(self, data: UserCreate) -> UserRead:
        """
        Crea un nuevo usuario.

        Reglas:
        - El email debe ser único.
        - El role_id debe referenciar un rol existente.
        - La contraseña se almacena como hash.
        """

        self._validate_email_unique(data.email)
        self._validate_role_exists(data.role_id)

        user = User(
            role_id=data.role_id,
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
        Actualiza un usuario existente (parcial).

        Reglas:
        - El usuario debe existir.
        - Si se cambia el email, debe seguir siendo único.
        - Si se cambia el role_id, debe referenciar un rol existente.
        - Si se envía nueva contraseña, se hashea antes de guardar.
        """

        user = self.repository.get_by_id(user_id)

        if not user:
            raise NotFoundException(
                message="Usuario no encontrado.",
            )

        update_data = data.model_dump(exclude_unset=True)

        if "email" in update_data and update_data["email"] != user.email:
            self._validate_email_unique(update_data["email"])

        if "role_id" in update_data:
            self._validate_role_exists(update_data["role_id"])

        if "password" in update_data:
            update_data["password"] = hash_password(update_data["password"])

        for field, value in update_data.items():
            setattr(user, field, value)

        updated_user = self.repository.update(user)
        return UserRead.model_validate(updated_user)

    def delete_user(self, user_id: uuid.UUID) -> None:
        """
        Desactiva un usuario (soft delete via is_active=False).

        Si el usuario ya está inactivo, se elimina físicamente.
        """

        user = self.repository.get_by_id(user_id)

        if not user:
            raise NotFoundException(
                message="Usuario no encontrado.",
            )

        if user.is_active:
            user.is_active = False
            self.repository.update(user)
        else:
            self.repository.delete(user)

    def _validate_email_unique(self, email: str) -> None:
        """Verifica que el email no esté registrado."""

        existing = self.repository.get_by_email(email)

        if existing:
            raise ConflictException(
                message="El email ya está registrado.",
            )

    def _validate_role_exists(self, role_id: uuid.UUID) -> None:
        """Verifica que el rol referenciado exista."""

        if not self.repository.role_exists(role_id):
            raise NotFoundException(
                message="El rol especificado no existe.",
            )
