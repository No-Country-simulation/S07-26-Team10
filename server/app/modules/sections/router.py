import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_db
from app.modules.reports.repository import ReportRepository
from app.modules.sections.repository import SectionRepository
from app.modules.sections.schema import (
    SectionCreate,
    SectionNavigationRead,
    SectionPublicRead,
    SectionRead,
    SectionUpdate,
)
from app.modules.sections.service import SectionService
from app.modules.users.model import User


router = APIRouter(
    prefix="/sections",
    tags=["sections"],
)


def get_section_service(
    db: Session = Depends(get_db),
) -> SectionService:
    """
    Factory para inyectar SectionService.
    """

    repository = SectionRepository(db)
    report_repository = ReportRepository(db)

    return SectionService(repository, report_repository)


# ==========================
# Endpoints públicos
# ==========================


@router.get(
    "/report/{report_id}",
    response_model=list[SectionPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar secciones publicadas",
    description="Obtiene las secciones publicadas de un reporte, ordenadas por display_order.",
    responses={
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_public_sections(
    report_id: uuid.UUID,
    service: SectionService = Depends(get_section_service),
) -> list[SectionPublicRead]:
    return service.get_public_sections(report_id)


@router.get(
    "/{slug}",
    response_model=SectionNavigationRead,
    status_code=HTTP_200_OK,
    summary="Obtener sección por slug",
    description="Obtiene una sección publicada por su slug con navegación anterior/siguiente.",
    responses={
        404: {
            "description": "Sección no encontrada",
        },
    },
)
def get_section_by_slug(
    slug: str,
    service: SectionService = Depends(get_section_service),
) -> SectionNavigationRead:
    return service.get_section_by_slug(slug)


# ==========================
# Endpoints administrativos
# ==========================


@router.get(
    "/report/{report_id}/admin",
    response_model=list[SectionRead],
    status_code=HTTP_200_OK,
    summary="Listar todas las secciones (admin)",
    description="Obtiene todas las secciones de un reporte, incluyendo no publicadas.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_all_sections(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: SectionService = Depends(get_section_service),
) -> list[SectionRead]:
    return service.get_all_sections(report_id)


@router.get(
    "/{section_id}/admin",
    response_model=SectionRead,
    status_code=HTTP_200_OK,
    summary="Obtener sección por ID (admin)",
    description="Obtiene una sección por su identificador con información completa.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Sección no encontrada",
        },
    },
)
def get_section_admin(
    section_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: SectionService = Depends(get_section_service),
) -> SectionRead:
    return service.get_section(section_id)


@router.post(
    "/",
    response_model=SectionRead,
    status_code=HTTP_201_CREATED,
    summary="Crear sección",
    description="Crea una nueva sección generando el slug automáticamente.",
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
def create_section(
    data: SectionCreate,
    current_user: User = Depends(get_current_user),
    service: SectionService = Depends(get_section_service),
) -> SectionRead:
    return service.create_section(data)


@router.patch(
    "/{section_id}",
    response_model=SectionRead,
    status_code=HTTP_200_OK,
    summary="Actualizar sección",
    description="Actualiza parcialmente una sección existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Sección no encontrada",
        },
        409: {
            "description": "Slug ya registrado",
        },
    },
)
def update_section(
    section_id: uuid.UUID,
    data: SectionUpdate,
    current_user: User = Depends(get_current_user),
    service: SectionService = Depends(get_section_service),
) -> SectionRead:
    return service.update_section(section_id, data)


@router.delete(
    "/{section_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar sección",
    description="Elimina una sección y sus resources asociados.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Sección no encontrada",
        },
    },
)
def delete_section(
    section_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: SectionService = Depends(get_section_service),
) -> None:
    service.delete_section(section_id)
