import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_section_service
from app.modules.sections.schema import (
    SectionCreate,
    SectionNavigationRead,
    SectionPublicRead,
    SectionRead,
    SectionUpdate,
)
from app.modules.sections.service import SectionService
from app.modules.users.model import User
from app.shared.enums.publication_status import PublicationStatus
from app.modules.sections.schema import SectionWithResourcesRead  # ← AGREGAR

router = APIRouter(
    prefix="/report-versions/{report_version_id}/sections",
    tags=["Sections"],
)


# ==================== ENDPOINTS PÚBLICOS (sin autenticación) ====================


@router.get(
    "",
    response_model=list[SectionPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar secciones públicas",
    description="Obtiene las secciones publicadas de una versión de reporte. (Acceso público)",
)
def get_public_sections(
    report_version_id: uuid.UUID,
    service: SectionService = Depends(get_section_service),
):
    """
    Obtiene las secciones publicadas de una versión de reporte.
    Acceso público - No requiere autenticación.
    """
    return service.get_public_sections(report_version_id)


@router.get(
    "/admin",
    response_model=list[SectionRead],
    status_code=HTTP_200_OK,
    summary="Listar todas las secciones (admin)",
    description="Obtiene todas las secciones de una versión de reporte. (Requiere autenticación)",
)
def get_all_sections(
    report_version_id: uuid.UUID,
    status: Optional[PublicationStatus] = Query(
        default=None,
        description="Filtrar por estado de publicación",
    ),
    service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todas las secciones de una versión de reporte (incluye borradores).
    Requiere autenticación.
    """
    return service.get_all_sections(report_version_id, status)


@router.get(
    "/by-slug/{slug}",
    response_model=SectionPublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener sección por slug",
    description="Obtiene una sección específica por su slug. (Acceso público)",
)
def get_section_by_slug(
    report_version_id: uuid.UUID,
    slug: str,
    service: SectionService = Depends(get_section_service),
):
    """
    Obtiene una sección específica por su slug.
    SOLO si está PUBLICADA.
    Acceso público - No requiere autenticación.
    """
    return service.get_section_by_slug(report_version_id, slug)


@router.get(
    "/admin/with-resources",
    response_model=list[SectionWithResourcesRead],
    status_code=HTTP_200_OK,
    summary="Listar secciones con recursos (admin)",
    description="Obtiene todas las secciones de una versión de reporte con sus recursos cargados. (Requiere autenticación)",
)
def get_all_sections_with_resources(
    report_version_id: uuid.UUID,
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, le=100, description="Límite de registros"),
    service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todas las secciones de una versión de reporte con sus recursos cargados.
    Incluye secciones DRAFT y PUBLISHED.
    Requiere autenticación.
    """
    return service.get_all_sections_with_resources(report_version_id, skip, limit)


@router.get(
    "/{section_id}",
    response_model=SectionPublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener sección pública",
    description="Obtiene una sección específica por su ID. (Acceso público)",
)
def get_public_section(
    report_version_id: uuid.UUID,
    section_id: uuid.UUID,
    service: SectionService = Depends(get_section_service),
):
    """
    Obtiene una sección específica por su ID.
    SOLO si está PUBLICADA.
    Acceso público - No requiere autenticación.
    """
    return service.get_public_section(report_version_id, section_id)


@router.get(
    "/admin/{section_id}",
    response_model=SectionRead,
    status_code=HTTP_200_OK,
    summary="Obtener sección por ID (admin)",
    description="Obtiene una sección específica por su ID con todos los detalles. (Requiere autenticación)",
)
def get_section_admin(
    report_version_id: uuid.UUID,
    section_id: uuid.UUID,
    service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene una sección específica por su ID con todos los detalles.
    Incluye secciones DRAFT y PUBLISHED.
    Requiere autenticación.
    """
    return service.get_section_admin(report_version_id, section_id)


@router.get(
    "/{section_id}/navigation",
    response_model=SectionNavigationRead,
    status_code=HTTP_200_OK,
    summary="Obtener sección con navegación",
    description="Obtiene una sección con navegación anterior/siguiente. (Acceso público)",
)
def get_section_with_navigation(
    report_version_id: uuid.UUID,
    section_id: uuid.UUID,
    service: SectionService = Depends(get_section_service),
):
    """
    Obtiene una sección con navegación anterior/siguiente.
    SOLO si está PUBLICADA.
    Acceso público - No requiere autenticación.
    """
    return service.get_section_with_navigation(report_version_id, section_id)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.post(
    "",
    response_model=SectionRead,
    status_code=HTTP_201_CREATED,
    summary="Crear sección",
    description="Crea una nueva sección en una versión de reporte. (Requiere autenticación)",
)
def create_section(
    report_version_id: uuid.UUID,
    data: SectionCreate,
    service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea una nueva sección.

    Reglas:
    - La versión de reporte debe existir.
    - El slug se genera automáticamente a partir del título.
    - El slug debe ser único dentro de la versión.
    - El status por defecto es DRAFT.
    - Requiere autenticación.
    """
    return service.create_section(report_version_id, data)


@router.patch(
    "/{section_id}",
    response_model=SectionRead,
    status_code=HTTP_200_OK,
    summary="Actualizar sección",
    description="Actualiza parcialmente una sección. (Requiere autenticación)",
)
def update_section(
    report_version_id: uuid.UUID,
    section_id: uuid.UUID,
    data: SectionUpdate,
    service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza parcialmente una sección.

    Campos actualizables:
    - title
    - content
    - display_order
    - status
    - Requiere autenticación.
    """
    return service.update_section(report_version_id, section_id, data)


@router.delete(
    "/{section_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar sección",
    description="Elimina una sección. (Requiere autenticación)",
)
def delete_section(
    report_version_id: uuid.UUID,
    section_id: uuid.UUID,
    service: SectionService = Depends(get_section_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina una sección.
    Requiere autenticación.
    """
    service.delete_section(report_version_id, section_id)
