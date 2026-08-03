from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import HTTP_200_OK
from app.core.dependencies import (
    get_current_user,
    get_db,
)
from app.modules.auth.schema import (
    CurrentUserResponse,
    LoginRequest,
    TokenResponse,
)
from app.modules.auth.service import AuthService
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


def get_auth_service(
    db: Session = Depends(get_db),
) -> AuthService:
    """
    Factory para inyectar AuthService.
    """

    repository = UserRepository(db)

    return AuthService(repository)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=HTTP_200_OK,
    summary="Iniciar sesión",
    description="Autentica un usuario y devuelve un JWT.",
    responses={
        401: {
            "description": "Credenciales inválidas o usuario inactivo",
        },
    },
)
def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return service.login(data)


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    status_code=HTTP_200_OK,
    summary="Usuario autenticado",
    description="Obtiene la información del usuario autenticado.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
    },
)
def me(
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> CurrentUserResponse:
    return service.me(current_user)