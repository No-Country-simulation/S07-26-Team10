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
from app.modules.concepts.repository import ConceptRepository
from app.modules.concepts.schema import (
    ConceptCreate,
    ConceptPublicRead,
    ConceptRead,
    ConceptUpdate,
)
from app.modules.concepts.service import ConceptService
from app.modules.users.model import User


router = APIRouter(
    prefix="/concepts",
    tags=["concepts"],
)


def get_concept_service(
    db: Session = Depends(get_db),
) -> ConceptService:
    """
    Factory para inyectar ConceptService.
    """

    repository = ConceptRepository(db)
    category_repository = CategoryRepository(db)

    return ConceptService(repository, category_repository)


# ==========================
# Endpoints públicos
# ==========================


@router.get(
    "/category/{category_id}",
    response_model=list[ConceptPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar conceptos de una categoría",
    description="Obtiene los conceptos de una categoría, ordenados por display_order.",
    responses={
        404: {
            "description": "Categoría no encontrada",
        },
    },
)
def get_public_concepts(
    category_id: uuid.UUID,
    service: ConceptService = Depends(get_concept_service),
) -> list[ConceptPublicRead]:
    return service.get_public_concepts(category_id)


@router.get(
    "/{concept_id}/public",
    response_model=ConceptPublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener concepto (público)",
    description="Obtiene un concepto por su identificador.",
    responses={
        404: {
            "description": "Concepto no encontrado",
        },
    },
)
def get_public_concept(
    concept_id: uuid.UUID,
    service: ConceptService = Depends(get_concept_service),
) -> ConceptPublicRead:
    return service.get_public_concept(concept_id)


# ==========================
# Endpoints administrativos
# ==========================


@router.get(
    "/category/{category_id}/admin",
    response_model=list[ConceptRead],
    status_code=HTTP_200_OK,
    summary="Listar todos los conceptos (admin)",
    description="Obtiene todos los conceptos de una categoría con información completa.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Categoría no encontrada",
        },
    },
)
def get_all_concepts(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ConceptService = Depends(get_concept_service),
) -> list[ConceptRead]:
    return service.get_all_concepts(category_id)


@router.get(
    "/{concept_id}",
    response_model=ConceptRead,
    status_code=HTTP_200_OK,
    summary="Obtener concepto por ID (admin)",
    description="Obtiene un concepto por su identificador con información completa.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Concepto no encontrado",
        },
    },
)
def get_concept(
    concept_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ConceptService = Depends(get_concept_service),
) -> ConceptRead:
    return service.get_concept(concept_id)


@router.post(
    "/",
    response_model=ConceptRead,
    status_code=HTTP_201_CREATED,
    summary="Crear concepto",
    description="Crea un nuevo concepto asociado a una categoría.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Categoría no encontrada",
        },
    },
)
def create_concept(
    data: ConceptCreate,
    current_user: User = Depends(get_current_user),
    service: ConceptService = Depends(get_concept_service),
) -> ConceptRead:
    return service.create_concept(data)


@router.patch(
    "/{concept_id}",
    response_model=ConceptRead,
    status_code=HTTP_200_OK,
    summary="Actualizar concepto",
    description="Actualiza parcialmente un concepto existente.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Concepto no encontrado",
        },
    },
)
def update_concept(
    concept_id: uuid.UUID,
    data: ConceptUpdate,
    current_user: User = Depends(get_current_user),
    service: ConceptService = Depends(get_concept_service),
) -> ConceptRead:
    return service.update_concept(concept_id, data)


@router.delete(
    "/{concept_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar concepto",
    description="Elimina un concepto.",
    responses={
        401: {
            "description": "Token inválido o expirado",
        },
        404: {
            "description": "Concepto no encontrado",
        },
    },
)
def delete_concept(
    concept_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: ConceptService = Depends(get_concept_service),
) -> None:
    service.delete_concept(concept_id)
