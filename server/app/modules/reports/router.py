import uuid

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user, get_report_service
from app.modules.reports.schema import (
    ReportCreate,
    ReportRead,
)
from app.modules.reports.service import ReportService
from app.modules.users.model import User

router = APIRouter(prefix="/reports", tags=["Reports"])


# ==================== ENDPOINTS PÚBLICOS (sin autenticación) ====================


@router.get(
    "",
    response_model=list[ReportRead],
    summary="Listar reportes",
    description="Obtiene todos los reportes con paginación. (Acceso público)",
)
def get_all_reports(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, le=100, description="Límite de registros"),
    service: ReportService = Depends(get_report_service),
):
    """
    Obtiene todos los reportes con paginación.
    Acceso público - No requiere autenticación.
    """
    return service.get_all_reports(skip, limit)


@router.get(
    "/{report_id}",
    response_model=ReportRead,
    summary="Obtener reporte por ID",
    description="Obtiene un reporte específico por su ID. (Acceso público)",
)
def get_report(
    report_id: uuid.UUID,
    service: ReportService = Depends(get_report_service),
):
    """
    Obtiene un reporte específico por su ID.
    Acceso público - No requiere autenticación.
    """
    return service.get_report(report_id)


@router.get(
    "/by-slug/{slug}",
    response_model=ReportRead,
    summary="Obtener reporte por slug",
    description="Obtiene un reporte específico por su slug. (Acceso público)",
)
def get_report_by_slug(
    slug: str,
    service: ReportService = Depends(get_report_service),
):
    """
    Obtiene un reporte específico por su slug.
    Acceso público - No requiere autenticación.
    """
    return service.get_report_by_slug(slug)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.post(
    "",
    response_model=ReportRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear reporte",
    description="Crea un nuevo reporte. El slug se genera automáticamente. (Requiere autenticación)",
)
def create_report(
    data: ReportCreate,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea un nuevo reporte.

    Reglas:
    - El slug se genera automáticamente.
    - El slug debe ser único.
    - Requiere autenticación.
    """
    return service.create_report(data)


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar reporte",
    description="Elimina un reporte y TODAS sus versiones en cascada. (Requiere autenticación)",
)
def delete_report(
    report_id: uuid.UUID,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina un reporte.

    Reglas:
    - Elimina el reporte y TODAS sus versiones en cascada.
    - Requiere autenticación.
    """
    service.delete_report(report_id)
