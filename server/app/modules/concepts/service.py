import uuid
from typing import Optional

from app.exceptions import ConflictException, NotFoundException
from app.modules.categories.repository import CategoryRepository
from app.modules.concepts.model import Concept
from app.modules.concepts.repository import ConceptRepository
from app.modules.concepts.schema import (
    ConceptCreate,
    ConceptPublicRead,
    ConceptRead,
    ConceptUpdate,
)
from app.shared.enums.publication_status import PublicationStatus


class ConceptService:
    """
    Servicio de lógica de negocio para conceptos.
    SOLO maneja operaciones relacionadas con Concept.
    """

    def __init__(
        self,
        repository: ConceptRepository,
        category_repository: CategoryRepository,
    ) -> None:
        self.repository = repository
        self.category_repository = category_repository

    def get_concept(
        self,
        concept_id: uuid.UUID,
    ) -> ConceptRead:
        """
        Obtiene un concepto por su ID (admin).
        """
        concept = self.repository.get_by_id(concept_id)

        if not concept:
            raise NotFoundException(
                message="Concepto no encontrado.",
            )

        return ConceptRead.model_validate(concept)

    def get_public_concept(
        self,
        category_id: uuid.UUID,
        concept_id: uuid.UUID,
    ) -> ConceptPublicRead:
        """
        Obtiene un concepto por su ID (acceso público).
        """
        concept = self.repository.get_by_id(concept_id)

        if not concept:
            raise NotFoundException(
                message="Concepto no encontrado.",
            )

            # Validar que el concepto pertenece a la categoría
        if concept.category_id != category_id:
            raise NotFoundException("Concepto no encontrado en esta categoría.")

        # Verificar que la categoría esté publicada
        category = self.category_repository.get_by_id(concept.category_id)
        if not category or category.status != PublicationStatus.PUBLISHED:
            raise NotFoundException(
                message="Concepto no disponible.",
            )

        return ConceptPublicRead.model_validate(concept)

    def get_public_concepts(
        self,
        category_id: uuid.UUID,
    ) -> list[ConceptPublicRead]:
        """
        Obtiene los conceptos de una categoría (acceso público).
        SOLO si la categoría está PUBLICADA.
        """
        category = self.category_repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        if category.status != PublicationStatus.PUBLISHED:
            raise NotFoundException(
                message="Categoría no disponible.",
            )

        concepts = self.repository.get_all_by_category(category_id)

        return [ConceptPublicRead.model_validate(concept) for concept in concepts]

    def get_all_concepts(
        self,
        category_id: uuid.UUID,
    ) -> list[ConceptRead]:
        """
        Obtiene todos los conceptos de una categoría (admin).
        """
        self._validate_category_exists(category_id)

        concepts = self.repository.get_all_by_category(category_id)

        return [ConceptRead.model_validate(concept) for concept in concepts]

    def create_concept(
        self,
        category_id: uuid.UUID,
        data: ConceptCreate,
    ) -> ConceptRead:
        """
        Crea un nuevo concepto.

        Reglas:
        - La categoría debe existir.
        - El nombre debe ser único dentro de la categoría.
        - Si no se provee display_order, se asigna el siguiente disponible.
        """
        # Validar que la categoría existe
        self._validate_category_exists(category_id)

        # Validar que el nombre sea único
        if self.repository.exists_by_name(category_id, data.name):
            raise ConflictException(
                message=f"Ya existe un concepto con el nombre '{data.name}' en esta categoría.",
            )

        display_order = data.display_order
        if display_order is None:
            max_order = self.repository.get_max_display_order(category_id)
            display_order = max_order + 1

        # Validar que el display_order sea único

        if display_order is not None:
            if self.repository.exists_by_display_order(category_id, display_order):
                raise ConflictException(
                    message=f"Ya existe un concepto con el orden '{display_order}' en esta categoría."
                )

        concept = Concept(
            category_id=category_id,
            name=data.name,
            description=data.description,
            display_order=display_order,
        )

        created_concept = self.repository.create(concept)

        return ConceptRead.model_validate(created_concept)

    def update_concept(
        self,
        category_id: uuid.UUID,
        concept_id: uuid.UUID,
        data: ConceptUpdate,
    ) -> ConceptRead:
        """
        Actualiza parcialmente un concepto.

        Reglas:
        - El concepto debe existir.
        - Si se cambia el nombre, debe ser único dentro de la categoría.
        """
        concept = self.repository.get_by_id(concept_id)

        if not concept:
            raise NotFoundException(
                message="Concepto no encontrado.",
            )

        if concept.category_id != category_id:
            raise NotFoundException(
                message="Concepto no encontrado en esta categoría.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        # Si se actualiza el nombre, validar unicidad
        if "name" in update_data:
            if self.repository.exists_by_name(
                concept.category_id,
                update_data["name"],
                exclude_id=concept_id,
            ):
                raise ConflictException(
                    message=f"Ya existe un concepto con el nombre '{update_data['name']}' en esta categoría.",
                )

        if "display_order" in update_data:
            if self.repository.exists_by_display_order(
                concept.category_id,
                update_data["display_order"],
                exclude_id=concept_id,
            ):
                raise ConflictException(
                    message=f"Ya existe un concepto con el orden '{update_data['display_order']}' en esta categoría."
                )

        for field, value in update_data.items():
            setattr(concept, field, value)

        updated_concept = self.repository.update(concept)

        return ConceptRead.model_validate(updated_concept)

    def delete_concept(
        self,
        category_id: uuid.UUID,
        concept_id: uuid.UUID,
    ) -> None:
        """
        Elimina un concepto.
        """
        concept = self.repository.get_by_id(concept_id)

        if not concept:
            raise NotFoundException(
                message="Concepto no encontrado.",
            )

        if concept.category_id != category_id:
            raise NotFoundException(
                message="Concepto no encontrado en esta categoría.",
            )

        self.repository.delete(concept)

    def _validate_category_exists(
        self,
        category_id: uuid.UUID,
    ) -> None:
        """
        Verifica que la categoría exista.
        """
        category = self.category_repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )
