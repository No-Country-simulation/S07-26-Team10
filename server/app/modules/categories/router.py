import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_current_user, get_db
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schema import (
    CategoryCreate,
    CategoryPublicRead,
    CategoryRead,
    CategoryUpdate,
)
from app.modules.categories.service import CategoryService
from app.modules.reports.repository import ReportRepository
from app.modules.users.model import User


router = APIRouter(
    prefix="/categories",
    tags=["categories"],
)


def get_category_service(
    db: Session = Depends(get_db),
) -> CategoryService:
    """
    Factory para inyectar CategoryService.
    """

    repository = CategoryRepository(db)
    report_repository = ReportRepository(db)

    return CategoryService(repository, report_repository)


# ==========================
# Endpoints públicos
# ==========================


@router.get(
    "/report/{report_id}",
    response_model=list[CategoryPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar categorías publicadas",
    description="Obtiene las categorías publicadas de un reporte, ordenadas por display_order.",
    responses={
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_public_categories(
    report_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
) -> list[CategoryPublicRead]:
    return service.get_public_categories(report_id)


# ==========================
# Endpoints administrativos
# ==========================


@router.get(
    "/report/{report_id}/admin",
    response_model=list[CategoryRead],
    status_code=HTTP_200_OK,
    summary="Listar todas las categorías (admin)",
    description="Obtiene todas las categorías de un reporte, incluyendo no publicadas.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def get_all_categories(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
) -> list[CategoryRead]:
    return service.get_all_categories(report_id)


@router.get(
    "/{category_id}",
    response_model=CategoryRead,
    status_code=HTTP_200_OK,
    summary="Obtener categoría por ID",
    description="Obtiene una categoría por su identificador.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Categoría no encontrada",
        },
    },
)
def get_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
) -> CategoryRead:
    return service.get_category(category_id)


@router.post(
    "/",
    response_model=CategoryRead,
    status_code=HTTP_201_CREATED,
    summary="Crear categoría",
    description="Crea una nueva categoría asociada a un reporte.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Reporte no encontrado",
        },
    },
)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
) -> CategoryRead:
    return service.create_category(data)


@router.patch(
    "/{category_id}",
    response_model=CategoryRead,
    status_code=HTTP_200_OK,
    summary="Actualizar categoría",
    description="Actualiza parcialmente una categoría existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Categoría no encontrada",
        },
    },
)
def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
) -> CategoryRead:
    return service.update_category(category_id, data)


@router.delete(
    "/{category_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar categoría",
    description="Elimina una categoría y sus conceptos asociados.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Categoría no encontrada",
        },
    },
)
def delete_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
) -> None:
    service.delete_category(category_id)
