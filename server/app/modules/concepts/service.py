import uuid

from app.exceptions import NotFoundException
from app.modules.categories.repository import CategoryRepository
from app.modules.concepts.model import Concept
from app.modules.concepts.repository import ConceptRepository
from app.modules.concepts.schema import (
    ConceptCreate,
    ConceptPublicRead,
    ConceptRead,
    ConceptUpdate,
)


class ConceptService:
    """
    Servicio de lógica de negocio para conceptos.
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

        return ConceptPublicRead.model_validate(concept)


    def get_public_concepts(
        self,
        category_id: uuid.UUID,
    ) -> list[ConceptPublicRead]:
        """
        Obtiene los conceptos de una categoría (acceso público).
        """

        self._validate_category_exists(category_id)

        concepts = self.repository.get_all_by_category(
            category_id,
        )

        return [
            ConceptPublicRead.model_validate(concept)
            for concept in concepts
        ]


    def get_all_concepts(
        self,
        category_id: uuid.UUID,
    ) -> list[ConceptRead]:
        """
        Obtiene todos los conceptos de una categoría (admin).
        """

        self._validate_category_exists(category_id)

        concepts = self.repository.get_all_by_category(
            category_id,
        )

        return [
            ConceptRead.model_validate(concept)
            for concept in concepts
        ]


    def create_concept(
        self,
        data: ConceptCreate,
    ) -> ConceptRead:
        """
        Crea un nuevo concepto.

        Reglas:
        - La categoría debe existir.
        - Si no se provee display_order, se asigna el siguiente disponible.
        """

        self._validate_category_exists(data.category_id)

        display_order = data.display_order

        if display_order is None:
            max_order = self.repository.get_max_display_order(
                data.category_id,
            )
            display_order = max_order + 1

        concept = Concept(
            category_id=data.category_id,
            name=data.name,
            description=data.description,
            display_order=display_order,
        )

        created_concept = self.repository.create(concept)

        return ConceptRead.model_validate(created_concept)


    def update_concept(
        self,
        concept_id: uuid.UUID,
        data: ConceptUpdate,
    ) -> ConceptRead:
        """
        Actualiza parcialmente un concepto.

        Reglas:
        - El concepto debe existir.
        """

        concept = self.repository.get_by_id(concept_id)

        if not concept:
            raise NotFoundException(
                message="Concepto no encontrado.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(concept, field, value)

        updated_concept = self.repository.update(concept)

        return ConceptRead.model_validate(updated_concept)


    def delete_concept(
        self,
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
