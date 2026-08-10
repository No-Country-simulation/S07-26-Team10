import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user, get_report_version_service
from app.modules.report_versions.schema import (
    ReportVersionCreate,
    ReportVersionDetailRead,
    ReportVersionRead,
    ReportVersionUpdate,
)
from app.modules.report_versions.service import ReportVersionService
from app.modules.users.model import User
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus

router = APIRouter(prefix="/reports/{report_id}/versions", tags=["Report Versions"])


# ==================== ENDPOINTS PÚBLICOS (sin autenticación) ====================


@router.get(
    "",
    response_model=list[ReportVersionRead],
    summary="Listar versiones de un reporte",
    description="Obtiene todas las versiones de un reporte específico. (Acceso público)",
)
def get_versions(
    report_id: uuid.UUID,
    status: Optional[PublicationStatus] = Query(
        default=None,
        description="Filtrar por estado de publicación",
    ),
    service: ReportVersionService = Depends(get_report_version_service),
):
    """
    Obtiene todas las versiones de un reporte.
    Acceso público - No requiere autenticación.
    """
    return service.get_versions_by_report(report_id, status)


@router.get(
    "/published",
    response_model=list[ReportVersionRead],
    summary="Listar versiones publicadas",
    description="Obtiene todas las versiones publicadas de un reporte. (Acceso público)",
)
def get_published_versions(
    report_id: uuid.UUID,
    service: ReportVersionService = Depends(get_report_version_service),
):
    """
    Obtiene todas las versiones publicadas de un reporte.
    Acceso público - No requiere autenticación.
    """
    return service.get_published_versions(report_id)


@router.get(
    "/{version_id}",
    response_model=ReportVersionRead | ReportVersionDetailRead,
    summary="Obtener versión por ID",
    description="Obtiene una versión específica por su ID. (Acceso público)",
)
def get_version(
    version_id: uuid.UUID,
    load_relations: bool = Query(
        default=False,
        description="Cargar relaciones (sections, references, categories)",
    ),
    service: ReportVersionService = Depends(get_report_version_service),
):
    """
    Obtiene una versión específica por su ID.
    Acceso público - No requiere autenticación.
    """
    return service.get_version(version_id, load_relations)


@router.get(
    "/by-language/{language}",
    response_model=ReportVersionRead,
    summary="Obtener versión por idioma",
    description="Obtiene una versión específica por idioma. (Acceso público)",
)
def get_version_by_language(
    report_id: uuid.UUID,
    language: LanguageCode,
    status: Optional[PublicationStatus] = Query(
        default=None,
        description="Filtrar por estado de publicación",
    ),
    service: ReportVersionService = Depends(get_report_version_service),
):
    """
    Obtiene una versión específica por idioma.
    Acceso público - No requiere autenticación.
    """
    return service.get_version_by_language(report_id, language, status)


@router.get(
    "/by-version/{version}",
    response_model=ReportVersionRead,
    summary="Obtener versión por número",
    description="Obtiene una versión específica por número de versión. (Acceso público)",
)
def get_version_by_number(
    report_id: uuid.UUID,
    version: str,
    language: Optional[LanguageCode] = Query(
        default=None,
        description="Filtrar por idioma",
    ),
    service: ReportVersionService = Depends(get_report_version_service),
):
    """
    Obtiene una versión específica por número de versión.
    Acceso público - No requiere autenticación.
    """
    return service.get_version_by_number(report_id, version, language)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.post(
    "",
    response_model=ReportVersionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear versión",
    description="Crea una nueva versión para un reporte existente. (Requiere autenticación)",
)
def create_version(
    report_id: uuid.UUID,
    data: ReportVersionCreate,
    service: ReportVersionService = Depends(get_report_version_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea una nueva versión de reporte.

    Reglas:
    - El reporte debe existir.
    - No puede existir otra versión con el mismo número e idioma.
    - El status por defecto es DRAFT.
    - Requiere autenticación.
    """
    return service.create_version(report_id, data)


@router.patch(
    "/{version_id}",
    response_model=ReportVersionRead,
    summary="Actualizar versión",
    description="Actualiza parcialmente una versión de reporte. (Requiere autenticación)",
)
def update_version(
    version_id: uuid.UUID,
    data: ReportVersionUpdate,
    service: ReportVersionService = Depends(get_report_version_service),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza parcialmente una versión de reporte.

    Campos actualizables:
    - title
    - summary
    - citation_text
    - status
    - Requiere autenticación.
    """
    return service.update_version(version_id, data)


@router.delete(
    "/{version_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar versión",
    description="Elimina una versión de reporte. (Requiere autenticación)",
)
def delete_version(
    version_id: uuid.UUID,
    service: ReportVersionService = Depends(get_report_version_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina una versión de reporte.
    Requiere autenticación.
    """
    service.delete_version(version_id)
