import uuid
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.orm import Session, selectinload

from app.modules.report_versions.model import ReportVersion
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


class ReportVersionRepository:
    """
    Repositorio de acceso a datos para versiones de reportes.
    SOLO maneja operaciones relacionadas con ReportVersion.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(
        self, version_id: uuid.UUID, load_relations: bool = False
    ) -> Optional[ReportVersion]:
        """
        Obtiene una versión de reporte por ID.

        Args:
            version_id: ID de la versión
            load_relations: Si debe cargar relaciones (sections, references, categories)
        """
        stmt = select(ReportVersion).where(ReportVersion.id == version_id)

        if load_relations:
            stmt = stmt.options(
                selectinload(ReportVersion.sections),
                selectinload(ReportVersion.references),
                selectinload(ReportVersion.categories),
            )

        return self.db.execute(stmt).scalars().first()

    def get_by_report_id(
        self, report_id: uuid.UUID, status: Optional[PublicationStatus] = None
    ) -> list[ReportVersion]:
        """
        Obtiene todas las versiones de un reporte.

        Args:
            report_id: ID del reporte padre
            status: Filtrar por estado de publicación
        """
        stmt = select(ReportVersion).where(ReportVersion.report_id == report_id)

        if status:
            stmt = stmt.where(ReportVersion.status == status)

        stmt = stmt.order_by(ReportVersion.created_at.desc())

        return list(self.db.execute(stmt).scalars().all())

    def get_by_language(
        self,
        report_id: uuid.UUID,
        language: LanguageCode,
        status: Optional[PublicationStatus] = None,
    ) -> Optional[ReportVersion]:
        """
        Obtiene una versión específica por idioma.
        """
        stmt = select(ReportVersion).where(
            and_(
                ReportVersion.report_id == report_id, ReportVersion.language == language
            )
        )

        if status:
            stmt = stmt.where(ReportVersion.status == status)

        return self.db.execute(stmt).scalars().first()

    def get_by_version(
        self,
        report_id: uuid.UUID,
        version: str,
        language: Optional[LanguageCode] = None,
    ) -> Optional[ReportVersion]:
        """
        Obtiene una versión específica por número de versión.
        """
        stmt = select(ReportVersion).where(
            and_(ReportVersion.report_id == report_id, ReportVersion.version == version)
        )

        if language:
            stmt = stmt.where(ReportVersion.language == language)

        return self.db.execute(stmt).scalars().first()

    def get_published_versions(self, report_id: uuid.UUID) -> list[ReportVersion]:
        """
        Obtiene todas las versiones publicadas de un reporte.
        """
        return self.get_by_report_id(report_id, status=PublicationStatus.PUBLISHED)

    def create(self, version: ReportVersion) -> ReportVersion:
        """
        Crea una nueva versión de reporte.
        """
        self.db.add(version)
        self.db.commit()
        self.db.refresh(version)
        return version

    def update(self, version: ReportVersion) -> ReportVersion:
        """
        Actualiza una versión existente.
        """
        self.db.commit()
        self.db.refresh(version)
        return version

    def delete(self, version: ReportVersion) -> None:
        """
        Elimina una versión de reporte.
        """
        self.db.delete(version)
        self.db.commit()

    def exists_by_version_and_language(
        self, report_id: uuid.UUID, version: str, language: LanguageCode
    ) -> bool:
        """
        Verifica si existe una versión con el número y idioma dados.
        """
        stmt = select(ReportVersion).where(
            and_(
                ReportVersion.report_id == report_id,
                ReportVersion.version == version,
                ReportVersion.language == language,
            )
        )
        return self.db.execute(stmt).scalars().first() is not None
