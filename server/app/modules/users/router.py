import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from app.core.dependencies import get_current_admin, get_db
from app.modules.users.model import User
from app.modules.users.repository import UserRepository
from app.modules.users.schema import UserCreate, UserRead, UserUpdate
from app.modules.users.service import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Factory de UserService inyectado vía Depends."""
    repository = UserRepository(db)
    return UserService(repository)


@router.get(
    "/",
    response_model=list[UserRead],
    status_code=HTTP_200_OK,
    summary="Listar usuarios",
    description="Obtiene el listado completo de usuarios con su rol. Requiere rol administrador.",
    responses={
        401: {"description": "Token inválido o expirado"},
        403: {"description": "Permisos insuficientes"},
    },
)
def list_users(
    current_user: User = Depends(get_current_admin),
    service: UserService = Depends(get_user_service),
) -> list[UserRead]:
    return service.list_users()


@router.get(
    "/{user_id}",
    response_model=UserRead,
    status_code=HTTP_200_OK,
    summary="Obtener usuario por ID",
    description="Obtiene un usuario específico por su ID. Requiere rol administrador.",
    responses={
        401: {"description": "Token inválido o expirado"},
        403: {"description": "Permisos insuficientes"},
        404: {"description": "Usuario no encontrado"},
    },
)
def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.get_user(user_id)


@router.post(
    "/",
    response_model=UserRead,
    status_code=HTTP_201_CREATED,
    summary="Crear usuario",
    description="Crea un nuevo usuario con rol asignado. La contraseña se almacena como hash. Requiere rol administrador.",
    responses={
        401: {"description": "Token inválido o expirado"},
        403: {"description": "Permisos insuficientes"},
        404: {"description": "Rol especificado no existe"},
        409: {"description": "Email ya registrado"},
    },
)
def create_user(
    data: UserCreate,
    current_user: User = Depends(get_current_admin),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.create_user(data)


@router.patch(
    "/{user_id}",
    response_model=UserRead,
    status_code=HTTP_200_OK,
    summary="Actualizar usuario",
    description="Actualiza parcialmente un usuario existente. Solo se modifican los campos enviados. Requiere rol administrador.",
    responses={
        401: {"description": "Token inválido o expirado"},
        403: {"description": "Permisos insuficientes"},
        404: {"description": "Usuario o rol no encontrado"},
        409: {"description": "Email ya registrado"},
    },
)
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    current_user: User = Depends(get_current_admin),
    service: UserService = Depends(get_user_service),
) -> UserRead:
    return service.update_user(user_id, data)


@router.delete(
    "/{user_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar usuario",
    description="Desactiva un usuario (soft delete). Si ya está inactivo, lo elimina físicamente. Requiere rol administrador.",
    responses={
        401: {"description": "Token inválido o expirado"},
        403: {"description": "Permisos insuficientes"},
        404: {"description": "Usuario no encontrado"},
    },
)
def delete_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_admin),
    service: UserService = Depends(get_user_service),
) -> None:
    service.delete_user(user_id)
