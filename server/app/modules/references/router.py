import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_db
from app.modules.references.repository import ReferenceRepository
from app.modules.references.schema import (
    ReferenceCreate,
    ReferencePublicRead,
    ReferenceRead,
    ReferenceUpdate,
)
from app.modules.references.service import ReferenceService
from app.modules.reports.repository import ReportRepository
from app.modules.users.model import User


router = APIRouter(
    prefix="/references",
    tags=["references"],
)


def get_reference_service(
    db: Session = Depends(get_db),
) -> ReferenceService:
    """
    Factory para inyectar ReferenceService.
    """

    repository = ReferenceRepository(db)
    report_repository = ReportRepository(db)

    return ReferenceService(repository, report_repository)


# ==========================
# Endpoints públicos
# ==========================


@router.get(
    "/report/{report_id}",
    response_model=list[ReferencePublicRead],
    status_code=HTTP_200_OK,
    summary="Listar referencias de un reporte",
    description="Obtiene las referencias de un reporte, ordenadas por display_order.",
    responses={
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_public_references(
    report_id: uuid.UUID,
    service: ReferenceService = Depends(get_reference_service),
) -> list[ReferencePublicRead]:
    return service.get_public_references(report_id)


# ==========================
# Endpoints administrativos
# ==========================


@router.get(
    "/report/{report_id}/admin",
    response_model=list[ReferenceRead],
    status_code=HTTP_200_OK,
    summary="Listar todas las referencias (admin)",
    description="Obtiene todas las referencias de un reporte con información completa.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_all_references(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ReferenceService = Depends(get_reference_service),
) -> list[ReferenceRead]:
    return service.get_all_references(report_id)


@router.get(
    "/{reference_id}",
    response_model=ReferenceRead,
    status_code=HTTP_200_OK,
    summary="Obtener referencia por ID",
    description="Obtiene una referencia por su identificador.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Referencia no encontrada",
        },
    },
)
def get_reference(
    reference_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ReferenceService = Depends(get_reference_service),
) -> ReferenceRead:
    return service.get_reference(reference_id)


@router.post(
    "/",
    response_model=ReferenceRead,
    status_code=HTTP_201_CREATED,
    summary="Crear referencia",
    description="Crea una nueva referencia asociada a un reporte.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def create_reference(
    data: ReferenceCreate,
    current_user: User = Depends(get_current_user),
    service: ReferenceService = Depends(get_reference_service),
) -> ReferenceRead:
    return service.create_reference(data)


@router.patch(
    "/{reference_id}",
    response_model=ReferenceRead,
    status_code=HTTP_200_OK,
    summary="Actualizar referencia",
    description="Actualiza parcialmente una referencia existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Referencia no encontrada",
        },
    },
)
def update_reference(
    reference_id: uuid.UUID,
    data: ReferenceUpdate,
    current_user: User = Depends(get_current_user),
    service: ReferenceService = Depends(get_reference_service),
) -> ReferenceRead:
    return service.update_reference(reference_id, data)


@router.delete(
    "/{reference_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar referencia",
    description="Elimina una referencia.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Referencia no encontrada",
        },
    },
)
def delete_reference(
    reference_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ReferenceService = Depends(get_reference_service),
) -> None:
    service.delete_reference(reference_id)
