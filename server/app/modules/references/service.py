import uuid

from app.exceptions import NotFoundException
from app.modules.references.model import Reference
from app.modules.references.repository import ReferenceRepository
from app.modules.references.schema import (
    ReferenceCreate,
    ReferencePublicRead,
    ReferenceRead,
    ReferenceUpdate,
)
from app.modules.reports.repository import ReportRepository


class ReferenceService:
    """
    Servicio de lógica de negocio para referencias.
    """

    def __init__(
        self,
        repository: ReferenceRepository,
        report_repository: ReportRepository,
    ) -> None:
        self.repository = repository
        self.report_repository = report_repository


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


    def get_public_references(
        self,
        report_id: uuid.UUID,
    ) -> list[ReferencePublicRead]:
        """
        Obtiene las referencias de un reporte (acceso público).
        """

        self._validate_report_exists(report_id)

        references = self.repository.get_all_by_report(
            report_id,
        )

        return [
            ReferencePublicRead.model_validate(reference)
            for reference in references
        ]


    def get_all_references(
        self,
        report_id: uuid.UUID,
    ) -> list[ReferenceRead]:
        """
        Obtiene todas las referencias de un reporte (admin).
        """

        self._validate_report_exists(report_id)

        references = self.repository.get_all_by_report(
            report_id,
        )

        return [
            ReferenceRead.model_validate(reference)
            for reference in references
        ]


    def create_reference(
        self,
        data: ReferenceCreate,
    ) -> ReferenceRead:
        """
        Crea una nueva referencia.

        Reglas:
        - El reporte debe existir.
        - display_order se asigna automáticamente (max + 1).
        """

        self._validate_report_exists(data.report_id)

        max_order = self.repository.get_max_display_order(
            data.report_id,
        )
        display_order = max_order + 1

        reference = Reference(
            report_id=data.report_id,
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
