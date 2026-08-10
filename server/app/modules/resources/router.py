import uuid

from fastapi import APIRouter, Depends, status

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_resource_service
from app.modules.resources.schema import (
    ResourceCreate,
    ResourcePublicRead,
    ResourceRead,
    ResourceUpdate,
)
from app.modules.resources.service import ResourceService
from app.modules.users.model import User

router = APIRouter(
    prefix="/sections/{section_id}/resources",
    tags=["Resources"],
)


# ==================== ENDPOINTS PÚBLICOS (sin autenticación) ====================


@router.get(
    "",
    response_model=list[ResourcePublicRead],
    status_code=HTTP_200_OK,
    summary="Listar recursos públicos",
    description="Obtiene todos los recursos de una sección. (Acceso público)",
)
def get_resources_by_section(
    section_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
):
    """
    Obtiene todos los recursos de una sección.
    Acceso público - No requiere autenticación.
    """
    return service.get_resources_by_section(section_id)


@router.get(
    "/{resource_id}",
    response_model=ResourcePublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener recurso público",
    description="Obtiene un recurso específico por su ID. (Acceso público)",
)
def get_public_resource(
    resource_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
):
    """
    Obtiene un recurso específico por su ID.
    Acceso público - No requiere autenticación.
    """
    return service.get_public_resource(resource_id)


@router.get(
    "/{resource_id}/download",
    response_model=ResourcePublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener recurso descargable",
    description="Obtiene un recurso específico solo si es descargable. (Acceso público)",
)
def get_downloadable_resource(
    resource_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
):
    """
    Obtiene un recurso específico solo si es descargable.
    Acceso público - No requiere autenticación.
    """
    return service.get_downloadable_resource(resource_id)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.get(
    "/admin",
    response_model=list[ResourceRead],
    status_code=HTTP_200_OK,
    summary="Listar todos los recursos (admin)",
    description="Obtiene todos los recursos de una sección con todos los detalles. (Requiere autenticación)",
)
def get_all_resources(
    section_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todos los recursos de una sección con todos los detalles.
    Requiere autenticación.
    """
    return service.get_all_resources(section_id)


@router.get(
    "/admin/{resource_id}",
    response_model=ResourceRead,
    status_code=HTTP_200_OK,
    summary="Obtener recurso por ID (admin)",
    description="Obtiene un recurso específico por su ID con todos los detalles. (Requiere autenticación)",
)
def get_resource(
    resource_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene un recurso específico por su ID con todos los detalles.
    Requiere autenticación.
    """
    return service.get_resource(resource_id)


@router.post(
    "",
    response_model=ResourceRead,
    status_code=HTTP_201_CREATED,
    summary="Crear recurso",
    description="Crea un nuevo recurso en una sección. (Requiere autenticación)",
)
def create_resource(
    section_id: uuid.UUID,
    data: ResourceCreate,
    service: ResourceService = Depends(get_resource_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea un nuevo recurso.

    Reglas:
    - La sección debe existir.
    - file_url y cloudinary_public_id vienen del servicio de uploads.
    - Requiere autenticación.
    """
    # NOTA: upload_data debe venir de un endpoint de upload previo
    # Este endpoint espera que el cliente primero suba el archivo
    # y luego pase los datos del resource
    return service.create_resource(section_id, data)


@router.patch(
    "/{resource_id}",
    response_model=ResourceRead,
    status_code=HTTP_200_OK,
    summary="Actualizar recurso",
    description="Actualiza parcialmente un recurso. (Requiere autenticación)",
)
def update_resource(
    resource_id: uuid.UUID,
    data: ResourceUpdate,
    service: ResourceService = Depends(get_resource_service),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza parcialmente un recurso.

    Campos actualizables:
    - type
    - title
    - description
    - alt_text
    - downloadable
    - Requiere autenticación.
    """
    return service.update_resource(resource_id, data)


@router.delete(
    "/{resource_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar recurso",
    description="Elimina un recurso de la BD. (Requiere autenticación)",
)
def delete_resource(
    resource_id: uuid.UUID,
    service: ResourceService = Depends(get_resource_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina un recurso de la BD.
    NOTA: El archivo en Cloudinary debe eliminarse por separado.
    Requiere autenticación.
    """
    service.delete_resource(resource_id)
    return None
