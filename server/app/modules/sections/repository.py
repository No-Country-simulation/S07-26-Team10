import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.sections.model import Section


class SectionRepository:
    """
    Repositorio de acceso a datos para secciones.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, section_id: uuid.UUID) -> Section | None:
        """
        Obtiene una sección por ID.
        """

        stmt = (
            select(Section)
            .where(Section.id == section_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_by_slug(self, slug: str) -> Section | None:
        """
        Obtiene una sección por slug.
        """

        stmt = (
            select(Section)
            .where(Section.slug == slug)
        )

        return self.db.execute(stmt).scalars().first()


    def get_all_by_report(
        self,
        report_id: uuid.UUID,
    ) -> list[Section]:
        """
        Obtiene todas las secciones de un reporte, ordenadas por display_order.
        """

        stmt = (
            select(Section)
            .where(Section.report_id == report_id)
            .order_by(Section.display_order)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_published_by_report(
        self,
        report_id: uuid.UUID,
    ) -> list[Section]:
        """
        Obtiene las secciones publicadas de un reporte, ordenadas por display_order.
        """

        stmt = (
            select(Section)
            .where(
                Section.report_id == report_id,
                Section.published == True,
            )
            .order_by(Section.display_order)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_max_display_order(
        self,
        report_id: uuid.UUID,
    ) -> int:
        """
        Obtiene el máximo display_order de las secciones de un reporte.
        Retorna 0 si no hay secciones.
        """

        stmt = (
            select(func.coalesce(func.max(Section.display_order), 0))
            .where(Section.report_id == report_id)
        )

        result = self.db.execute(stmt).scalar()

        return result or 0


    def get_adjacent_published(
        self,
        report_id: uuid.UUID,
        current_display_order: int,
    ) -> tuple[Section | None, Section | None]:
        """
        Obtiene la sección publicada anterior y siguiente respecto
        del display_order actual dentro del mismo reporte.
        """

        previous_stmt = (
            select(Section)
            .where(
                Section.report_id == report_id,
                Section.published == True,
                Section.display_order < current_display_order,
            )
            .order_by(Section.display_order.desc())
            .limit(1)
        )

        next_stmt = (
            select(Section)
            .where(
                Section.report_id == report_id,
                Section.published == True,
                Section.display_order > current_display_order,
            )
            .order_by(Section.display_order)
            .limit(1)
        )

        previous = self.db.execute(previous_stmt).scalars().first()
        next_section = self.db.execute(next_stmt).scalars().first()

        return previous, next_section


    def create(self, section: Section) -> Section:
        """
        Crea una sección.
        """

        self.db.add(section)
        self.db.commit()
        self.db.refresh(section)

        return section


    def update(self, section: Section) -> Section:
        """
        Actualiza una sección.
        """

        self.db.commit()
        self.db.refresh(section)

        return section


    def delete(self, section: Section) -> None:
        """
        Elimina una sección.
        """

        self.db.delete(section)
        self.db.commit()
