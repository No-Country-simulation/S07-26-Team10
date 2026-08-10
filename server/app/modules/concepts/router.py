import uuid

from fastapi import APIRouter, Depends, status

from app.core.constants import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)
from app.core.dependencies import get_concept_service, get_current_user
from app.modules.concepts.schema import (
    ConceptCreate,
    ConceptPublicRead,
    ConceptRead,
    ConceptUpdate,
)
from app.modules.concepts.service import ConceptService
from app.modules.users.model import User

router = APIRouter(
    prefix="/categories/{category_id}/concepts",
    tags=["Concepts"],
)


# ==================== ENDPOINTS PÚBLICOS (sin autenticación) ====================


@router.get(
    "",
    response_model=list[ConceptPublicRead],
    status_code=HTTP_200_OK,
    summary="Listar conceptos públicos",
    description="Obtiene los conceptos de una categoría. (Acceso público)",
)
def get_public_concepts(
    category_id: uuid.UUID,
    service: ConceptService = Depends(get_concept_service),
):
    """
    Obtiene los conceptos de una categoría.
    SOLO si la categoría está PUBLICADA.
    Acceso público - No requiere autenticación.
    """
    return service.get_public_concepts(category_id)


@router.get(
    "/admin",
    response_model=list[ConceptRead],
    status_code=HTTP_200_OK,
    summary="Listar todos los conceptos (admin)",
    description="Obtiene todos los conceptos de una categoría. (Requiere autenticación)",
)
def get_all_concepts(
    category_id: uuid.UUID,
    service: ConceptService = Depends(get_concept_service),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene todos los conceptos de una categoría (incluye borradores).
    Requiere autenticación.
    """
    return service.get_all_concepts(category_id)


@router.get(
    "/{concept_id}",
    response_model=ConceptPublicRead,
    status_code=HTTP_200_OK,
    summary="Obtener concepto público",
    description="Obtiene un concepto específico por su ID. (Acceso público)",
)
def get_public_concept(
    category_id: uuid.UUID,
    concept_id: uuid.UUID,
    service: ConceptService = Depends(get_concept_service),
):
    """
    Obtiene un concepto específico por su ID.
    SOLO si su categoría está PUBLICADA.
    Acceso público - No requiere autenticación.
    """
    return service.get_public_concept(category_id, concept_id)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.post(
    "",
    response_model=ConceptRead,
    status_code=HTTP_201_CREATED,
    summary="Crear concepto",
    description="Crea un nuevo concepto en una categoría. (Requiere autenticación)",
)
def create_concept(
    category_id: uuid.UUID,
    data: ConceptCreate,
    service: ConceptService = Depends(get_concept_service),
    current_user: User = Depends(get_current_user),
):
    """
    Crea un nuevo concepto.

    Reglas:
    - La categoría debe existir.
    - El nombre debe ser único dentro de la categoría.
    - Requiere autenticación.
    """
    return service.create_concept(category_id, data)


@router.patch(
    "/{concept_id}",
    response_model=ConceptRead,
    status_code=HTTP_200_OK,
    summary="Actualizar concepto",
    description="Actualiza parcialmente un concepto. (Requiere autenticación)",
)
def update_concept(
    category_id: uuid.UUID,
    concept_id: uuid.UUID,
    data: ConceptUpdate,
    service: ConceptService = Depends(get_concept_service),
    current_user: User = Depends(get_current_user),
):
    """
    Actualiza parcialmente un concepto.

    Campos actualizables:
    - name
    - description
    - display_order
    - Requiere autenticación.
    """
    return service.update_concept(category_id, concept_id, data)


@router.delete(
    "/{concept_id}",
    status_code=HTTP_204_NO_CONTENT,
    summary="Eliminar concepto",
    description="Elimina un concepto. (Requiere autenticación)",
)
def delete_concept(
    category_id: uuid.UUID,
    concept_id: uuid.UUID,
    service: ConceptService = Depends(get_concept_service),
    current_user: User = Depends(get_current_user),
):
    """
    Elimina un concepto.
    Requiere autenticación.
    """
    service.delete_concept(category_id, concept_id)
