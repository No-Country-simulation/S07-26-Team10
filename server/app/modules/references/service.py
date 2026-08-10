import uuid
from typing import Optional

from app.exceptions import NotFoundException
from app.modules.references.model import Reference
from app.modules.references.repository import ReferenceRepository
from app.modules.references.schema import (
    ReferenceCreate,
    ReferenceRead,
    ReferenceUpdate,
)
from app.modules.report_versions.repository import ReportVersionRepository


class ReferenceService:
    """
    Servicio de lógica de negocio para referencias.
    SOLO maneja operaciones relacionadas con Reference.
    """

    def __init__(
        self,
        repository: ReferenceRepository,
        report_version_repository: ReportVersionRepository,
    ) -> None:
        self.repository = repository
        self.report_version_repository = report_version_repository

    def get_reference(
        self,
        reference_id: uuid.UUID,
    ) -> ReferenceRead:
        """
        Obtiene una referencia por su ID.
        """
        reference = self.repository.get_by_id(reference_id)

        if not reference:
            raise NotFoundException(
                message="Referencia no encontrada.",
            )

        return ReferenceRead.model_validate(reference)

    def get_references_by_report_version(
        self,
        report_version_id: uuid.UUID,
    ) -> list[ReferenceRead]:
        """
        Obtiene todas las referencias de una versión de reporte.
        """
        self._validate_report_version_exists(report_version_id)

        references = self.repository.get_by_report_version_id(report_version_id)

        return [ReferenceRead.model_validate(reference) for reference in references]

    def create_reference(
        self,
        report_version_id: uuid.UUID,
        data: ReferenceCreate,
    ) -> ReferenceRead:
        """
        Crea una nueva referencia.

        Reglas:
        - La versión de reporte debe existir.
        - Si no se provee display_order, se asigna el siguiente.
        """
        self._validate_report_version_exists(report_version_id)

        display_order = data.display_order
        if display_order is None:
            max_order = self.repository.get_max_display_order(report_version_id)
            display_order = max_order + 1

        reference = Reference(
            report_version_id=report_version_id,
            authors=data.authors,
            title=data.title,
            year=data.year,
            source=data.source,
            citation_url=data.citation_url,
            display_order=display_order,
        )

        created_reference = self.repository.create(reference)

        return ReferenceRead.model_validate(created_reference)

    def update_reference(
        self,
        reference_id: uuid.UUID,
        data: ReferenceUpdate,
    ) -> ReferenceRead:
        """
        Actualiza parcialmente una referencia.

        Reglas:
        - La referencia debe existir.
        """
        reference = self.repository.get_by_id(reference_id)

        if not reference:
            raise NotFoundException(
                message="Referencia no encontrada.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(reference, field, value)

        updated_reference = self.repository.update(reference)

        return ReferenceRead.model_validate(updated_reference)

    def delete_reference(
        self,
        reference_id: uuid.UUID,
    ) -> None:
        """
        Elimina una referencia.
        """
        reference = self.repository.get_by_id(reference_id)

        if not reference:
            raise NotFoundException(
                message="Referencia no encontrada.",
            )

        self.repository.delete(reference)

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
