import uuid

from fastapi import APIRouter, Depends, status

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_reference_service
from app.modules.references.schema import (
    ReferenceCreate,
    ReferenceRead,
    ReferenceUpdate,
)
from app.modules.references.service import ReferenceService
from app.modules.users.model import User

router = APIRouter(
    prefix="/report-versions/{report_version_id}/references",
    tags=["References"],
)


# ==================== ENDPOINTS PÚBLICOS (sin autenticación) ====================


@router.get(
    "",
    response_model=list[ReferenceRead],
    status_code=HTTP_200_OK,
    summary="Listar referencias",
    description="Obtiene todas las referencias de una versión de reporte. (Acceso público)",
)
def get_references_by_report_version(
    report_version_id: uuid.UUID,
    service: ReferenceService = Depends(get_reference_service),
):
    """
    Obtiene todas las referencias de una versión de reporte.
    Acceso público - No requiere autenticación.
    """
    return service.get_references_by_report_version(report_version_id)


@router.get(
    "/{reference_id}",
    response_model=ReferenceRead,
    status_code=HTTP_200_OK,
    summary="Obtener referencia por ID",
    description="Obtiene una referencia específica por su ID. (Acceso público)",
)
def get_reference(
    report_version_id: uuid.UUID,
    reference_id: uuid.UUID,
    service: ReferenceService = Depends(get_reference_service),
):
    """
    Obtiene una referencia específica por su ID.
    Acceso público - No requiere autenticación.
    """
    return service.get_reference(report_version_id, reference_id)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.post(
    "",
    response_model=ReferenceRead,
    status_code=HTTP_201_CREATED,
    summary="Crear referencia",
    description="Crea una nueva referencia en una versión de reporte. (Requiere autenticación)",
)
def create_reference(
    report_version_id: uuid.UUID,
    data: ReferenceCreate,
    service: ReferenceService = Depends(get_reference_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea una nueva referencia.

    Reglas:
    - La versión de reporte debe existir.
    - Si no se provee display_order, se asigna el siguiente.
    - Requiere autenticación.
    """
    return service.create_reference(report_version_id, data)


@router.patch(
    "/{reference_id}",
    response_model=ReferenceRead,
    status_code=HTTP_200_OK,
    summary="Actualizar referencia",
    description="Actualiza parcialmente una referencia. (Requiere autenticación)",
)
def update_reference(
    report_version_id: uuid.UUID,
    reference_id: uuid.UUID,
    data: ReferenceUpdate,
    service: ReferenceService = Depends(get_reference_service),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza parcialmente una referencia.

    Campos actualizables:
    - authors
    - title
    - year
    - source
    - citation_url
    - display_order
    - Requiere autenticación.
    """
    return service.update_reference(report_version_id, reference_id, data)


@router.delete(
    "/{reference_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar referencia",
    description="Elimina una referencia. (Requiere autenticación)",
)
def delete_reference(
    report_version_id: uuid.UUID,
    reference_id: uuid.UUID,
    service: ReferenceService = Depends(get_reference_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina una referencia.
    Requiere autenticación.
    """
    service.delete_reference(report_version_id, reference_id)
    return None
