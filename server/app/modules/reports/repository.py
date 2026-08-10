import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.reports.model import Report


class ReportRepository:
    """
    Repositorio de acceso a datos para reportes.
    SOLO maneja operaciones CRUD del modelo Report.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, report_id: uuid.UUID) -> Optional[Report]:
        """
        Obtiene un reporte por ID.
        """
        stmt = select(Report).where(Report.id == report_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_slug(self, slug: str) -> Optional[Report]:
        """
        Obtiene un reporte por slug.
        """
        stmt = select(Report).where(Report.slug == slug)
        return self.db.execute(stmt).scalars().first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Report]:
        """
        Obtiene todos los reportes con paginación.
        """
        stmt = select(Report).order_by(Report.created_at.desc())
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, report: Report) -> Report:
        """
        Crea un nuevo reporte.
        """
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete(self, report: Report) -> None:
        """
        Elimina un reporte.
        """
        self.db.delete(report)
        self.db.commit()

    def exists_by_slug(self, slug: str) -> bool:
        """
        Verifica si existe un reporte con el slug dado.
        """
        stmt = select(Report).where(Report.slug == slug)
        return self.db.execute(stmt).scalars().first() is not None
