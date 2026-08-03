import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.reports.model import Report


class ReportRepository:
    """
    Repositorio de acceso a datos para reportes.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, report_id: uuid.UUID) -> Report | None:
        """
        Obtiene un reporte por ID.
        """

        stmt = (
            select(Report)
            .where(Report.id == report_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_by_slug(self, slug: str) -> Report | None:
        """
        Obtiene un reporte por slug.
        """

        stmt = (
            select(Report)
            .where(Report.slug == slug)
        )

        return self.db.execute(stmt).scalars().first()


    def get_all(self) -> list[Report]:
        """
        Obtiene todos los reportes ordenados por fecha de creación.
        """

        stmt = (
            select(Report)
            .order_by(Report.created_at.desc())
        )

        return list(self.db.execute(stmt).scalars().all())


    def create(self, report: Report) -> Report:
        """
        Crea un reporte.
        """

        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)

        return report


    def update(self, report: Report) -> Report:
        """
        Actualiza un reporte.
        """

        self.db.commit()
        self.db.refresh(report)

        return report
