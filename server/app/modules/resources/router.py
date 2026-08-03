import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_db
from app.modules.resources.repository import ResourceRepository
from app.modules.resources.schema import (
    ResourceCreate,
    ResourcePublicRead,
    ResourceRead,
    ResourceUpdate,
)
from app.modules.resources.service import ResourceService
from app.modules.sections.repository import SectionRepository
from app.modules.users.model import User


router = APIRouter(
    prefix="/resources",
    tags=["resources"],
)


def get_resource_service(
    db: Session = Depends(get_db),
) -> ResourceService:
    """
    Factory para inyectar ResourceService.
    """

    repository = ResourceRepository(db)
    section_repository = SectionRepository(db)

    return ResourceService(repository, section_repository)


# ==========================
# Endpoints públicos
# ==========================


@router.get(
    "/section/{section_id}",
    response_model=list[ResourcePublicRead],
    status_code=HTTP_200_OK,
    summary="Listar resources de una sección",
    description="Obtiene los resources de una sección.",
    responses={
        404: {
            "description": "Sección no encontrada",
        },
    },
)
def get_public_resources(
    section_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
) -> list[ResourcePublicRead]:
    return service.get_public_resources(section_id)


@router.get(
    "/{resource_id}/download",
    response_model=ResourcePublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener resource descargable",
    description="Obtiene la metadata de un resource disponible para descarga.",
    responses={
        404: {
            "description": "Recurso no encontrado o no disponible para descarga",
        },
    },
)
def get_downloadable_resource(
    resource_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
) -> ResourcePublicRead:
    return service.get_downloadable_resource(resource_id)


# ==========================
# Endpoints administrativos
# ==========================


@router.get(
    "/section/{section_id}/admin",
    response_model=list[ResourceRead],
    status_code=HTTP_200_OK,
    summary="Listar todos los resources (admin)",
    description="Obtiene todos los resources de una sección con información completa.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Sección no encontrada",
        },
    },
)
def get_all_resources(
    section_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ResourceService = Depends(get_resource_service),
) -> list[ResourceRead]:
    return service.get_all_resources(section_id)


@router.get(
    "/{resource_id}",
    response_model=ResourceRead,
    status_code=HTTP_200_OK,
    summary="Obtener resource por ID",
    description="Obtiene un resource por su identificador.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Recurso no encontrado",
        },
    },
)
def get_resource(
    resource_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ResourceService = Depends(get_resource_service),
) -> ResourceRead:
    return service.get_resource(resource_id)


@router.post(
    "/",
    response_model=ResourceRead,
    status_code=HTTP_201_CREATED,
    summary="Crear resource",
    description="Crea un nuevo resource asociado a una sección.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Sección no encontrada",
        },
    },
)
def create_resource(
    data: ResourceCreate,
    current_user: User = Depends(get_current_user),
    service: ResourceService = Depends(get_resource_service),
) -> ResourceRead:
    return service.create_resource(data)


@router.patch(
    "/{resource_id}",
    response_model=ResourceRead,
    status_code=HTTP_200_OK,
    summary="Actualizar resource",
    description="Actualiza parcialmente un resource existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Recurso no encontrado",
        },
    },
)
def update_resource(
    resource_id: uuid.UUID,
    data: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    service: ResourceService = Depends(get_resource_service),
) -> ResourceRead:
    return service.update_resource(resource_id, data)


@router.delete(
    "/{resource_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar resource",
    description="Elimina un resource.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Recurso no encontrado",
        },
    },
)
def delete_resource(
    resource_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ResourceService = Depends(get_resource_service),
) -> None:
    service.delete_resource(resource_id)
