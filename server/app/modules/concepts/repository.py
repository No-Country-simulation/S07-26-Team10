import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.concepts.model import Concept


class ConceptRepository:
    """
    Repositorio de acceso a datos para conceptos.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, concept_id: uuid.UUID) -> Concept | None:
        """
        Obtiene un concepto por ID.
        """

        stmt = (
            select(Concept)
            .where(Concept.id == concept_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_all_by_category(
        self,
        category_id: uuid.UUID,
    ) -> list[Concept]:
        """
        Obtiene todos los conceptos de una categoría, ordenados por display_order.
        """

        stmt = (
            select(Concept)
            .where(Concept.category_id == category_id)
            .order_by(Concept.display_order)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_max_display_order(
        self,
        category_id: uuid.UUID,
    ) -> int:
        """
        Obtiene el máximo display_order de los conceptos de una categoría.
        Retorna 0 si no hay conceptos.
        """

        stmt = (
            select(func.coalesce(func.max(Concept.display_order), 0))
            .where(Concept.category_id == category_id)
        )

        result = self.db.execute(stmt).scalar()

        return result or 0


    def create(self, concept: Concept) -> Concept:
        """
        Crea un concepto.
        """

        self.db.add(concept)
        self.db.commit()
        self.db.refresh(concept)

        return concept


    def update(self, concept: Concept) -> Concept:
        """
        Actualiza un concepto.
        """

        self.db.commit()
        self.db.refresh(concept)

        return concept


    def delete(self, concept: Concept) -> None:
        """
        Elimina un concepto.
        """

        self.db.delete(concept)
        self.db.commit()
