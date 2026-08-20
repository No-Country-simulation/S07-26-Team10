from app.core.security import (
    create_access_token,
    verify_password,
)
from app.exceptions import UnauthorizedException
from app.modules.auth.schema import (
    CurrentUserResponse,
    LoginRequest,
    TokenResponse,
)
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


class AuthService:
    """
    Servicio de autenticación.
    """

    def __init__(
        self,
        repository: UserRepository,
    ) -> None:
        self.repository = repository


    def login(
        self,
        data: LoginRequest,
    ) -> TokenResponse:
        """
        Autentica un usuario y genera un JWT.

        Reglas:
        - El usuario debe existir.
        - La contraseña debe ser válida.
        - El usuario debe estar activo.
        """

        user = self.repository.get_by_email(
            data.email,
        )

        if user is None:
            raise UnauthorizedException(
                message="Credenciales inválidas.",
            )

        if not verify_password(
            data.password,
            user.password,
        ):
            raise UnauthorizedException(
                message="Credenciales inválidas.",
            )

        if not user.is_active:
            raise UnauthorizedException(
                message="Usuario inactivo.",
            )

        access_token = create_access_token(
            subject=str(user.id),
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
        )


    def me(
        self,
        current_user: User,
    ) -> CurrentUserResponse:
        """
        Devuelve la información del usuario autenticado.
        """

        return CurrentUserResponse.model_validate(
            current_user,
        )