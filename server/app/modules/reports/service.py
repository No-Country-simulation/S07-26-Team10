import uuid

from app.exceptions import ConflictException, NotFoundException
from app.modules.reports.model import Report
from app.modules.reports.repository import ReportRepository
from app.modules.reports.schema import (
    ReportCreate,
    ReportPublicRead,
    ReportRead,
    ReportUpdate,
)
from app.shared.utils.slug import generate_slug


class ReportService:
    """
    Servicio de lógica de negocio para reportes.
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


    def get_report_by_slug(self, slug: str) -> ReportPublicRead:
        """
        Obtiene un reporte por su slug (acceso público).
        """

        report = self.repository.get_by_slug(slug)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        return ReportPublicRead.model_validate(report)


    def get_all_reports(self) -> list[ReportPublicRead]:
        """
        Obtiene todos los reportes (acceso público).
        """

        reports = self.repository.get_all()

        return [
            ReportPublicRead.model_validate(report)
            for report in reports
        ]


    def create_report(self, data: ReportCreate) -> ReportRead:
        """
        Crea un nuevo reporte.

        Reglas:
        - El slug se genera automáticamente a partir del título.
        - El slug debe ser único.
        """

        slug = generate_slug(data.title)

        self._validate_slug_unique(slug)

        report = Report(
            title=data.title,
            slug=slug,
            summary=data.summary,
            citation_text=data.citation_text,
        )

        created_report = self.repository.create(report)

        return ReportRead.model_validate(created_report)


    def update_report(
        self,
        report_id: uuid.UUID,
        data: ReportUpdate,
    ) -> ReportRead:
        """
        Actualiza parcialmente un reporte.

        Reglas:
        - El reporte debe existir.
        - Si el título cambia, se regenera el slug.
        - El slug debe mantenerse único.
        """

        report = self.repository.get_by_id(report_id)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if "title" in update_data:
            new_slug = generate_slug(update_data["title"])

            self._validate_slug_unique(
                new_slug,
                exclude_id=report_id,
            )

            update_data["slug"] = new_slug

        for field, value in update_data.items():
            setattr(report, field, value)

        updated_report = self.repository.update(report)

        return ReportRead.model_validate(updated_report)


    def _validate_slug_unique(
        self,
        slug: str,
        exclude_id: uuid.UUID | None = None,
    ) -> None:
        """
        Verifica que el slug no esté registrado.
        """

        existing = self.repository.get_by_slug(slug)

        if existing and existing.id != exclude_id:
            raise ConflictException(
                message="El slug ya está registrado.",
            )
