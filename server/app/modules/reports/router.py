import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import HTTP_200_OK, HTTP_201_CREATED
from app.core.dependencies import get_current_user, get_db
from app.modules.reports.repository import ReportRepository
from app.modules.reports.schema import (
    ReportCreate,
    ReportPublicRead,
    ReportRead,
    ReportUpdate,
)
from app.modules.reports.service import ReportService
from app.modules.users.model import User


router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


def get_report_service(
    db: Session = Depends(get_db),
) -> ReportService:
    """
    Factory para inyectar ReportService.
    """

    repository = ReportRepository(db)

    return ReportService(repository)


# ==========================
# Endpoints públicos
# ==========================


@router.get(
    "/",
    response_model=list[ReportPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar reportes",
    description="Obtiene todos los reportes disponibles.",
)
def get_reports(
    service: ReportService = Depends(get_report_service),
) -> list[ReportPublicRead]:
    return service.get_all_reports()


@router.get(
    "/{slug}",
    response_model=ReportPublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener reporte por slug",
    description="Obtiene un reporte por su slug (URL amigable).",
    responses={
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_report_by_slug(
    slug: str,
    service: ReportService = Depends(get_report_service),
) -> ReportPublicRead:
    return service.get_report_by_slug(slug)


# ==========================
# Endpoints administrativos
# ==========================


@router.get(
    "/{report_id}/admin",
    response_model=ReportRead,
    status_code=HTTP_200_OK,
    summary="Obtener reporte por ID (admin)",
    description="Obtiene un reporte con información completa por su identificador.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_report_admin(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> ReportRead:
    return service.get_report(report_id)


@router.post(
    "/",
    response_model=ReportRead,
    status_code=HTTP_201_CREATED,
    summary="Crear reporte",
    description="Crea un nuevo reporte generando el slug automáticamente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        409: {
            "description": "Slug ya registrado",
        },
    },
)
def create_report(
    data: ReportCreate,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> ReportRead:
    return service.create_report(data)


@router.patch(
    "/{report_id}",
    response_model=ReportRead,
    status_code=HTTP_200_OK,
    summary="Actualizar reporte",
    description="Actualiza parcialmente un reporte existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
        409: {
            "description": "Slug ya registrado",
        },
    },
)
def update_report(
    report_id: uuid.UUID,
    data: ReportUpdate,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service),
) -> ReportRead:
    return service.update_report(report_id, data)
