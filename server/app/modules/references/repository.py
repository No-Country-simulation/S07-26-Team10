import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.references.model import Reference


class ReferenceRepository:
    """
    Repositorio de acceso a datos para referencias.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, reference_id: uuid.UUID) -> Reference | None:
        """
        Obtiene una referencia por ID.
        """

        stmt = (
            select(Reference)
            .where(Reference.id == reference_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_all_by_report(
        self,
        report_id: uuid.UUID,
    ) -> list[Reference]:
        """
        Obtiene todas las referencias de un reporte, ordenadas por display_order.
        """

        stmt = (
            select(Reference)
            .where(Reference.report_id == report_id)
            .order_by(Reference.display_order)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_max_display_order(
        self,
        report_id: uuid.UUID,
    ) -> int:
        """
        Obtiene el máximo display_order de las referencias de un reporte.
        Retorna 0 si no hay referencias.
        """

        stmt = (
            select(func.coalesce(func.max(Reference.display_order), 0))
            .where(Reference.report_id == report_id)
        )

        result = self.db.execute(stmt).scalar()

        return result or 0


    def create(self, reference: Reference) -> Reference:
        """
        Crea una referencia.
        """

        self.db.add(reference)
        self.db.commit()
        self.db.refresh(reference)

        return reference


    def update(self, reference: Reference) -> Reference:
        """
        Actualiza una referencia.
        """

        self.db.commit()
        self.db.refresh(reference)

        return reference


    def delete(self, reference: Reference) -> None:
        """
        Elimina una referencia.
        """

        self.db.delete(reference)
        self.db.commit()
