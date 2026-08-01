from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import HTTP_200_OK
from app.core.dependencies import get_current_user, get_db
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schema import LoginRequest, TokenResponse, UserRead
from app.modules.auth.service import AuthService
from app.modules.users.model import User

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Factory de AuthService inyectado vía Depends."""
    repository = AuthRepository(db)
    return AuthService(repository)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=HTTP_200_OK,
    summary="Iniciar sesión",
    description="Autentica al usuario con email y contraseña, devuelve un token JWT.",
)
def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return service.authenticate(
        email=data.email,
        password=data.password,
    )


@router.get(
    "/me",
    response_model=UserRead,
    status_code=HTTP_200_OK,
    summary="Obtener usuario autenticado",
    description="Devuelve la información del usuario autenticado actual.",
)
def get_me(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> UserRead:
    return service.get_current_user_data(current_user)
