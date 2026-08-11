import uuid
from datetime import datetime

from app.exceptions import NotFoundException
from app.modules.reports.model import Report
from app.modules.reports.repository import ReportRepository
from app.modules.reports.schema import (
    ReportCreate,
    ReportRead,
    ReportUpdate,
    ReportWithVersionsRead,
)


class ReportService:
    """
    Servicio de lógica de negocio para reportes.
    SOLO maneja operaciones relacionadas con Report.
    """

    def __init__(self, repository: ReportRepository) -> None:
        self.repository = repository

    def get_report(self, report_id: uuid.UUID) -> ReportRead:
        """
        Obtiene un reporte por su ID.
        """
        report = self.repository.get_by_id(report_id)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        return ReportRead.model_validate(report)

    def get_report_by_slug(self, slug: str) -> ReportRead:
        """
        Obtiene un reporte por su slug.
        """
        report = self.repository.get_by_slug(slug)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        return ReportRead.model_validate(report)

    def get_all_reports(self, skip: int = 0, limit: int = 100) -> list[ReportRead]:
        """
        Obtiene todos los reportes con paginación.
        """
        reports = self.repository.get_all(skip, limit)

        return [ReportRead.model_validate(report) for report in reports]

    def create_report(self, data: ReportCreate) -> ReportRead:
        """
        Crea un nuevo reporte.

        Reglas:
        - El slug se genera automáticamente.
        - El slug debe ser único.
        """
        slug = self._generate_unique_slug()

        report = Report(
            slug=slug,
        )

        created_report = self.repository.create(report)

        return ReportRead.model_validate(created_report)

    def delete_report(self, report_id: uuid.UUID) -> None:
        """
        Elimina un reporte.
        """
        report = self.repository.get_by_id(report_id)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        self.repository.delete(report)

    def _generate_unique_slug(self) -> str:
        """
        Genera un slug único y corto.

        Formato: r-{timestamp}-{short_uuid}
        Ejemplo: r-20240115-a3f
        """
        timestamp = datetime.now().strftime("%Y%m%d")
        short_id = str(uuid.uuid4())[:4]
        slug = f"r-{timestamp}-{short_id}"

        # Verificar que sea único
        if self.repository.exists_by_slug(slug):
            counter = 1
            while self.repository.exists_by_slug(f"{slug}-{counter}"):
                counter += 1
            slug = f"{slug}-{counter}"

        return slug

    def get_all_reports_with_versions(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ReportWithVersionsRead]:
        """
        Obtiene todos los reportes con todas sus versiones.
        """
        reports = self.repository.get_all_with_versions(skip, limit)

        return [ReportWithVersionsRead.model_validate(report) for report in reports]
