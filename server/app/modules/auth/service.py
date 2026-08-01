from app.core.constants import ADMIN_ROLE_NAME, TOKEN_TYPE
from app.core.security import create_access_token, verify_password
from app.exceptions import ForbiddenException, UnauthorizedException
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schema import TokenResponse, UserRead
from app.modules.users.model import User


class AuthService:
    """Servicio de lógica de negocio para autenticación."""

    def __init__(self, repository: AuthRepository) -> None:
        self.repository = repository

    def authenticate(self, email: str, password: str) -> TokenResponse:
        """
        Valida credenciales y genera un token de acceso.

        Reglas:
        - El usuario debe existir.
        - La contraseña debe ser correcta.
        - El usuario debe estar activo.
        - No se revela si el error fue por email o contraseña (anti-enumeración).
        """

        user = self.repository.get_user_by_email(email)

        if not user or not verify_password(password, user.password):
            raise UnauthorizedException(
                message="Credenciales inválidas.",
            )

        if not user.is_active:
            raise UnauthorizedException(
                message="Credenciales inválidas.",
            )

        token_data = {"sub": str(user.id)}
        access_token = create_access_token(data=token_data)

        return TokenResponse(
            access_token=access_token,
            token_type=TOKEN_TYPE,
        )

    def get_current_user_data(self, user: User) -> UserRead:
        """Serializa los datos del usuario autenticado."""

        return UserRead.model_validate(user)

    def require_admin(self, user: User) -> None:
        """
        Verifica que el usuario tenga rol de administrador.

        Lanza ForbiddenException si el rol no coincide.
        """

        if user.role.name != ADMIN_ROLE_NAME:
            raise ForbiddenException(
                message="No tiene permisos para realizar esta acción.",
            )
