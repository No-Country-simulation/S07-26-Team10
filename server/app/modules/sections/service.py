import uuid
from typing import Optional

from app.exceptions import ConflictException, NotFoundException
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.resources.repository import ResourceRepository
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
from app.shared.enums.publication_status import PublicationStatus
from app.shared.utils.slug import generate_slug


class SectionService:
    """
    Servicio de lógica de negocio para secciones.
    SOLO maneja operaciones relacionadas con Section.
    """

    def __init__(
        self,
        repository: SectionRepository,
        report_version_repository: ReportVersionRepository,
        resource_repository: Optional[ResourceRepository] = None,
    ) -> None:
        self.repository = repository
        self.report_version_repository = report_version_repository
        self.resource_repository = resource_repository

    def get_section(
        self,
        section_id: uuid.UUID,
    ) -> SectionRead:
        """
        Obtiene una sección por su ID (admin).
        """
        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        return SectionRead.model_validate(section)

    def get_public_section(
        self,
        section_id: uuid.UUID,
    ) -> SectionPublicRead:
        """
        Obtiene una sección por su ID (acceso público).
        """
        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        if section.status != PublicationStatus.PUBLISHED:
            raise NotFoundException(
                message="Sección no disponible.",
            )

        return SectionPublicRead.model_validate(section)

    def get_public_sections(
        self,
        report_version_id: uuid.UUID,
    ) -> list[SectionPublicRead]:
        """
        Obtiene las secciones publicadas de una versión de reporte.
        """
        self._validate_report_version_exists(report_version_id)

        sections = self.repository.get_published_by_report_version(report_version_id)

        return [SectionPublicRead.model_validate(section) for section in sections]

    def get_all_sections(
        self,
        report_version_id: uuid.UUID,
        status: Optional[PublicationStatus] = None,
    ) -> list[SectionRead]:
        """
        Obtiene todas las secciones de una versión de reporte (admin).
        """
        self._validate_report_version_exists(report_version_id)

        sections = self.repository.get_by_report_version_id(report_version_id, status)

        return [SectionRead.model_validate(section) for section in sections]

    def get_section_by_slug(
        self,
        report_version_id: uuid.UUID,
        slug: str,
    ) -> SectionPublicRead:
        """
        Obtiene una sección por su slug (acceso público).
        """
        self._validate_report_version_exists(report_version_id)

        section = self.repository.get_by_slug(report_version_id, slug)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        if section.status != PublicationStatus.PUBLISHED:
            raise NotFoundException(
                message="Sección no disponible.",
            )

        return SectionPublicRead.model_validate(section)

    def get_section_with_navigation(
        self,
        report_version_id: uuid.UUID,
        section_id: uuid.UUID,
    ) -> SectionNavigationRead:
        """
        Obtiene una sección con navegación anterior/siguiente (acceso público).
        """
        self._validate_report_version_exists(report_version_id)

        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        if section.status != PublicationStatus.PUBLISHED:
            raise NotFoundException(
                message="Sección no disponible.",
            )

        # Obtener todas las secciones publicadas de la versión
        published_sections = self.repository.get_published_by_report_version(
            report_version_id
        )

        # Encontrar índice actual
        current_index = None
        for i, s in enumerate(published_sections):
            if s.id == section_id:
                current_index = i
                break

        previous_section = None
        next_section = None

        if current_index is not None:
            if current_index > 0:
                prev = published_sections[current_index - 1]
                previous_section = SectionSummary(
                    id=prev.id,
                    title=prev.title,
                    slug=prev.slug,
                )
            if current_index < len(published_sections) - 1:
                nxt = published_sections[current_index + 1]
                next_section = SectionSummary(
                    id=nxt.id,
                    title=nxt.title,
                    slug=nxt.slug,
                )

        return SectionNavigationRead(
            id=section.id,
            report_version_id=section.report_version_id,
            title=section.title,
            slug=section.slug,
            content=section.content,
            display_order=section.display_order,
            previous_section=previous_section,
            next_section=next_section,
        )

    def create_section(
        self,
        report_version_id: uuid.UUID,
        data: SectionCreate,
    ) -> SectionRead:
        """
        Crea una nueva sección.

        Reglas:
        - La versión de reporte debe existir.
        - El slug se genera automáticamente a partir del título.
        - El slug debe ser único dentro de la versión.
        - Si no se provee display_order, se asigna el siguiente.
        - El status por defecto es DRAFT.
        """
        self._validate_report_version_exists(report_version_id)

        slug = generate_slug(data.title)

        if self.repository.exists_by_slug(report_version_id, slug):
            raise ConflictException(
                message=f"Ya existe una sección con el slug '{slug}' en esta versión.",
            )

        display_order = data.display_order
        if display_order is None:
            max_order = self.repository.get_max_display_order(report_version_id)
            display_order = max_order + 1

        section = Section(
            report_version_id=report_version_id,
            title=data.title,
            slug=slug,
            content=data.content,
            display_order=display_order,
            status=PublicationStatus.DRAFT,
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
        - Si se cambia el título, se regenera el slug.
        - El slug debe mantenerse único dentro de la versión.
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

            if self.repository.exists_by_slug(
                section.report_version_id,
                new_slug,
                exclude_id=section_id,
            ):
                raise ConflictException(
                    message=f"Ya existe una sección con el slug '{new_slug}' en esta versión.",
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
        """
        section = self.repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )

        self.repository.delete(section)

    def _validate_report_version_exists(
        self,
        report_version_id: uuid.UUID,
    ) -> None:
        """
        Verifica que la versión de reporte exista.
        """
        report_version = self.report_version_repository.get_by_id(report_version_id)

        if not report_version:
            raise NotFoundException(
                message="Versión de reporte no encontrada.",
            )
