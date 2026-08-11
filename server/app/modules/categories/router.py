import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_category_service
from app.modules.categories.schema import (
    CategoryCreate,
    CategoryPublicRead,
    CategoryRead,
    CategoryUpdate,
)
from app.modules.categories.service import CategoryService
from app.modules.users.model import User
from app.shared.enums.publication_status import PublicationStatus

router = APIRouter(
    prefix="/report-versions/{report_version_id}/categories", tags=["Categories"]
)


# ==================== ENDPOINTS fijas ====================


@router.get(
    "",
    response_model=list[CategoryPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar categorías publicadas",
    description="Obtiene las categorías publicadas de una versión de reporte. (Acceso público)",
)
def get_published_categories(
    report_version_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
):
    """
    Obtiene las categorías publicadas de una versión de reporte.
    Acceso público - No requiere autenticación.
    """
    return service.get_published_categories(report_version_id)


@router.get(
    "/admin",
    response_model=list[CategoryRead],
    status_code=HTTP_200_OK,
    summary="Listar todas las categorías (admin)",
    description="Obtiene todas las categorías de una versión de reporte, incluyendo no publicadas. (Requiere autenticación)",
)
def get_all_categories(
    report_version_id: uuid.UUID,
    status: Optional[PublicationStatus] = Query(
        default=None,
        description="Filtrar por estado de publicación",
    ),
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todas las categorías de una versión de reporte.
    Requiere autenticación.
    """
    return service.get_categories_by_report_version(report_version_id, status)


@router.get(
    "/{category_id}",
    response_model=CategoryPublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener categoría por ID (público)",
    description="Obtiene una categoría específica por su ID. (Acceso público)",
)
def get_public_category(
    report_version_id: uuid.UUID,
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
):
    """
    Obtiene una categoría específica por su ID.
    Acceso público - No requiere autenticación.
    """
    return service.get_category(report_version_id, category_id)

@router.get(
    "/admin/{category_id}",
    response_model=CategoryRead,
    status_code=HTTP_200_OK,
    summary="Obtener categoría por ID (admin)",
    description="Obtiene una categoría específica por su ID con todos los detalles. (Requiere autenticación)",
)
def get_category_admin(
    report_version_id: uuid.UUID,
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene una categoría específica por su ID con todos los detalles.
    Incluye categorías DRAFT y PUBLISHED.
    Requiere autenticación.
    """
    return service.get_category(report_version_id, category_id)
# ==================== ENDPOINTS dinamicas ====================


@router.post(
    "",
    response_model=CategoryRead,
    status_code=HTTP_201_CREATED,
    summary="Crear categoría",
    description="Crea una nueva categoría para una versión de reporte. (Requiere autenticación)",
)
def create_category(
    report_version_id: uuid.UUID,
    data: CategoryCreate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea una nueva categoría.

    Reglas:
    - La versión de reporte debe existir.
    - El nombre debe ser único dentro de la versión.
    - El status por defecto es DRAFT.
    - Requiere autenticación.
    """
    return service.create_category(report_version_id, data)


@router.patch(
    "/{category_id}",
    response_model=CategoryRead,
    status_code=HTTP_200_OK,
    summary="Actualizar categoría",
    description="Actualiza parcialmente una categoría. (Requiere autenticación)",
)
def update_category(
    report_version_id: uuid.UUID,
    category_id: uuid.UUID,
    data: CategoryUpdate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza parcialmente una categoría.

    Campos actualizables:
    - name
    - description
    - display_order
    - status
    - Requiere autenticación.
    """
    return service.update_category(report_version_id, category_id, data)


@router.delete(
    "/{category_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar categoría",
    description="Elimina una categoría y TODOS sus conceptos en cascada. (Requiere autenticación)",
)
def delete_category(
    report_version_id: uuid.UUID,
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina una categoría.

    Reglas:
    - Elimina la categoría y TODOS sus conceptos en cascada.
    - Requiere autenticación.
    """
    service.delete_category(report_version_id, category_id)
