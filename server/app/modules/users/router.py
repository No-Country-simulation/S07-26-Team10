import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import HTTP_200_OK, HTTP_201_CREATED
from app.core.dependencies import get_current_user, get_db
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate, UserRead, UserUpdate
from app.modules.users.service import UserService


router = APIRouter(
    prefix="/users",
    tags=["users"],
)


def get_user_service(
    db: Session = Depends(get_db),
) -> UserService:
    """
    Factory para inyectar UserService.
    """

    repository = UserRepository(db)

    return UserService(repository)


@router.get(
    "/{user_id}",
    response_model=UserRead,
    status_code=HTTP_200_OK,
    summary="Obtener usuario por ID",
    description="Obtiene un usuario por su identificador.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Usuario no encontrado",
        },
    },
)
def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.get_user(user_id)


@router.post(
    "/",
    response_model=UserRead,
    status_code=HTTP_201_CREATED,
    summary="Crear usuario",
    description="Crea un usuario almacenando la contraseña como hash.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        409: {
            "description": "Email ya registrado",
        },
    },
)
def create_user(
    data: UserCreate,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.create_user(data)


@router.patch(
    "/{user_id}",
    response_model=UserRead,
    status_code=HTTP_200_OK,
    summary="Actualizar usuario",
    description="Actualiza parcialmente un usuario existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Usuario no encontrado",
        },
        409: {
            "description": "Email ya registrado",
        },
    },
)
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.update_user(
        user_id,
        data,
    )


@router.patch(
    "/{user_id}/deactivate",
    response_model=UserRead,
    status_code=HTTP_200_OK,
    summary="Desactivar usuario",
    description="Cambia el estado del usuario a inactivo.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Usuario no encontrado",
        },
    },
)
def deactivate_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.deactivate_user(user_id)