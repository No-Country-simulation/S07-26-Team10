import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.sections.model import Section
from app.shared.enums.publication_status import PublicationStatus
from sqlalchemy.orm import Session, selectinload


class SectionRepository:
    """
    Repositorio de acceso a datos para secciones.
    SOLO maneja operaciones CRUD del modelo Section.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, section_id: uuid.UUID) -> Section | None:
        """
        Obtiene una sección por ID.
        """
        stmt = select(Section).where(Section.id == section_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_slug(
        self,
        report_version_id: uuid.UUID,
        slug: str,
    ) -> Section | None:
        """
        Obtiene una sección por slug dentro de una versión de reporte.
        """
        stmt = select(Section).where(
            Section.report_version_id == report_version_id,
            Section.slug == slug,
        )
        return self.db.execute(stmt).scalars().first()

    def get_by_report_version_id(
        self,
        report_version_id: uuid.UUID,
        status: PublicationStatus | None = None,
    ) -> list[Section]:
        """
        Obtiene todas las secciones de una versión de reporte.

        Args:
            report_version_id: ID de la versión del reporte
            status: Filtrar por estado de publicación (opcional)
        """
        stmt = select(Section).where(Section.report_version_id == report_version_id)

        if status:
            stmt = stmt.where(Section.status == status)

        stmt = stmt.order_by(Section.display_order)

        return list(self.db.execute(stmt).scalars().all())

    def get_published_by_report_version(
        self,
        report_version_id: uuid.UUID,
    ) -> list[Section]:
        """
        Obtiene las secciones publicadas de una versión de reporte.
        """
        return self.get_by_report_version_id(
            report_version_id,
            status=PublicationStatus.PUBLISHED,
        )

    def get_max_display_order(
        self,
        report_version_id: uuid.UUID,
    ) -> int:
        """
        Obtiene el máximo display_order de las secciones de una versión de reporte.
        Retorna 0 si no hay secciones.
        """
        stmt = select(func.coalesce(func.max(Section.display_order), 0)).where(
            Section.report_version_id == report_version_id
        )
        result = self.db.execute(stmt).scalar()
        return result or 0

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

    def exists_by_slug(
        self,
        report_version_id: uuid.UUID,
        slug: str,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        """
        Verifica si existe una sección con el mismo slug en la misma versión de reporte.
        """
        stmt = select(Section).where(
            Section.report_version_id == report_version_id,
            Section.slug == slug,
        )

        if exclude_id:
            stmt = stmt.where(Section.id != exclude_id)

        return self.db.execute(stmt).scalars().first() is not None

    def exists_by_display_order(
        self,
        report_version_id: uuid.UUID,
        display_order: int,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        stmt = select(Section).where(
            Section.report_version_id == report_version_id,
            Section.display_order == display_order,
        )
        if exclude_id:
            stmt = stmt.where(Section.id != exclude_id)
        return self.db.execute(stmt).scalars().first() is not None

    def get_all_with_resources(
        self,
        report_version_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Section]:
        """
        Obtiene todas las secciones de una versión de reporte con sus recursos cargados.
        """
        stmt = (
            select(Section)
            .where(Section.report_version_id == report_version_id)
            .options(selectinload(Section.resources))
            .order_by(Section.display_order)
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
