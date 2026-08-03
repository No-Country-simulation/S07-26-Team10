import uuid

from app.exceptions import ConflictException, NotFoundException
from app.modules.reports.repository import ReportRepository
from app.modules.sections.model import Section
from app.modules.sections.repository import SectionRepository
from app.modules.sections.schema import (
    SectionCreate,
    SectionNavigationRead,
    SectionPublicRead,
    SectionRead,
    SectionSummary,
    SectionUpdate,
)
from app.shared.utils.slug import generate_slug


class SectionService:
    """
    Servicio de lógica de negocio para secciones.
    """

    def __init__(
        self,
        repository: SectionRepository,
        report_repository: ReportRepository,
    ) -> None:
        self.repository = repository
        self.report_repository = report_repository


    def get_section(
        self,
        section_id: uuid.UUID,
    ) -> SectionRead:
        """
        Obtiene una sección por su ID.
        """

        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        return SectionRead.model_validate(section)


    def get_section_by_slug(
        self,
        slug: str,
    ) -> SectionNavigationRead:
        """
        Obtiene una sección publicada por slug con navegación anterior/siguiente.
        """

        section = self.repository.get_by_slug(slug)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        if not section.published:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        previous_section = None
        next_section = None

        if section.display_order is not None:
            previous, next_s = self.repository.get_adjacent_published(
                section.report_id,
                section.display_order,
            )

            if previous:
                previous_section = SectionSummary.model_validate(
                    previous,
                )

            if next_s:
                next_section = SectionSummary.model_validate(
                    next_s,
                )

        return SectionNavigationRead(
            id=section.id,
            report_id=section.report_id,
            title=section.title,
            slug=section.slug,
            content=section.content,
            display_order=section.display_order,
            previous_section=previous_section,
            next_section=next_section,
        )


    def get_public_sections(
        self,
        report_id: uuid.UUID,
    ) -> list[SectionPublicRead]:
        """
        Obtiene las secciones publicadas de un reporte.
        """

        self._validate_report_exists(report_id)

        sections = self.repository.get_published_by_report(
            report_id,
        )

        return [
            SectionPublicRead.model_validate(section)
            for section in sections
        ]


    def get_all_sections(
        self,
        report_id: uuid.UUID,
    ) -> list[SectionRead]:
        """
        Obtiene todas las secciones de un reporte (admin).
        """

        self._validate_report_exists(report_id)

        sections = self.repository.get_all_by_report(
            report_id,
        )

        return [
            SectionRead.model_validate(section)
            for section in sections
        ]


    def create_section(
        self,
        data: SectionCreate,
    ) -> SectionRead:
        """
        Crea una nueva sección.

        Reglas:
        - El reporte debe existir.
        - El slug se genera automáticamente a partir del título.
        - El slug debe ser único.
        - Si no se provee display_order, se asigna el siguiente disponible.
        """

        self._validate_report_exists(data.report_id)

        slug = generate_slug(data.title)

        self._validate_slug_unique(slug)

        display_order = data.display_order

        if display_order is None:
            max_order = self.repository.get_max_display_order(
                data.report_id,
            )
            display_order = max_order + 1

        section = Section(
            report_id=data.report_id,
            title=data.title,
            slug=slug,
            content=data.content,
            display_order=display_order,
            published=data.published,
        )

        created_section = self.repository.create(section)

        return SectionRead.model_validate(created_section)


    def update_section(
        self,
        section_id: uuid.UUID,
        data: SectionUpdate,
    ) -> SectionRead:
        """
        Actualiza parcialmente una sección.

        Reglas:
        - La sección debe existir.
        - Si el título cambia, se regenera el slug.
        - El slug debe mantenerse único.
        """

        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if "title" in update_data:
            new_slug = generate_slug(update_data["title"])

            self._validate_slug_unique(
                new_slug,
                exclude_id=section_id,
            )

            update_data["slug"] = new_slug

        for field, value in update_data.items():
            setattr(section, field, value)

        updated_section = self.repository.update(section)

        return SectionRead.model_validate(updated_section)


    def delete_section(
        self,
        section_id: uuid.UUID,
    ) -> None:
        """
        Elimina una sección.

        La eliminación en cascada de resources hijos es manejada
        por SQLAlchemy (cascade="all, delete-orphan").
        """

        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        self.repository.delete(section)


    def _validate_report_exists(
        self,
        report_id: uuid.UUID,
    ) -> None:
        """
        Verifica que el reporte exista.
        """

        report = self.report_repository.get_by_id(report_id)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )


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
