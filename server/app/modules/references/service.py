import uuid
from typing import Optional

from app.exceptions import NotFoundException, ConflictException
from app.modules.references.model import Reference
from app.modules.references.repository import ReferenceRepository
from app.modules.references.schema import (
    ReferenceCreate,
    ReferenceRead,
    ReferenceUpdate,
)
from app.modules.report_versions.repository import ReportVersionRepository
from app.shared.utils.validators import (
    validate_report_version_exists,
    validate_report_version_published,
)


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
        report_version_id: uuid.UUID,
        reference_id: uuid.UUID,
    ) -> ReferenceRead:
        """
        Obtiene una referencia por su ID (admin).
        """
        reference = self.repository.get_by_id(reference_id)

        if not reference:
            raise NotFoundException(
                message="Referencia no encontrada.",
            )

        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        return ReferenceRead.model_validate(reference)

    def get_references_by_report_version(
        self,
        report_version_id: uuid.UUID,
    ) -> list[ReferenceRead]:
        """
        Obtiene todas las referencias de una versión de reporte (acceso público).
        SOLO si la versión del reporte está PUBLICADA.
        """
        validate_report_version_published(
            report_version_id, self.report_version_repository
        )

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
        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        display_order = data.display_order
        if display_order is None:
            max_order = self.repository.get_max_display_order(report_version_id)
            display_order = max_order + 1

        # Validar que el display_order sea único

        if display_order is not None:
            if self.repository.exists_by_display_order(
                report_version_id, display_order
            ):
                raise ConflictException(
                    message=f"Ya existe una referencia con el orden '{display_order}' en esta versión."
                )

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
        report_version_id: uuid.UUID,
        reference_id: uuid.UUID,
        data: ReferenceUpdate,
    ) -> ReferenceRead:
        """
        Actualiza parcialmente una referencia.

        Reglas:
        - La referencia debe existir.
        - La versión de reporte debe existir.
        """
        reference = self.repository.get_by_id(reference_id)

        if not reference:
            raise NotFoundException(
                message="Referencia no encontrada.",
            )

        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if "display_order" in update_data:
            if self.repository.exists_by_display_order(
                reference.report_version_id,
                update_data["display_order"],
                exclude_id=reference_id,
            ):
                raise ConflictException(
                    message=f"Ya existe una referencia con el orden '{update_data['display_order']}' en esta versión."
                )

        for field, value in update_data.items():
            setattr(reference, field, value)

        updated_reference = self.repository.update(reference)

        return ReferenceRead.model_validate(updated_reference)

    def delete_reference(
        self,
        report_version_id: uuid.UUID,
        reference_id: uuid.UUID,
    ) -> None:
        """
        Elimina una referencia.
        - La versión de reporte debe existir.
        - La referencia debe existir.
        """
        reference = self.repository.get_by_id(reference_id)

        if not reference:
            raise NotFoundException(
                message="Referencia no encontrada.",
            )

        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        self.repository.delete(reference)
