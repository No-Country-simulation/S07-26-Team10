import uuid
from typing import Optional

from app.exceptions import ConflictException, NotFoundException
from app.modules.report_versions.model import ReportVersion
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.report_versions.schema import (
    ReportVersionCreate,
    ReportVersionDetailRead,
    ReportVersionFullRead,
    ReportVersionRead,
    ReportVersionUpdate,
)
from app.modules.reports.repository import ReportRepository
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


class ReportVersionService:
    """
    Servicio de lógica de negocio para versiones de reportes.
    SOLO maneja operaciones relacionadas con ReportVersion.
    """

    def __init__(
        self,
        repository: ReportVersionRepository,
        report_repository: ReportRepository,
    ) -> None:
        self.repository = repository
        self.report_repository = report_repository

    def get_version(
        self, report_id: uuid.UUID, version_id: uuid.UUID, load_relations: bool = False
    ) -> ReportVersionRead | ReportVersionDetailRead:
        """
        Obtiene una versión por su ID.

        Args:
            version_id: ID de la versión
            load_relations: Si debe cargar relaciones (sections, references, categories)
        """
        version = self.repository.get_by_id(version_id, load_relations)

        if not version:
            raise NotFoundException(
                message="Versión no encontrada.",
            )

        if version.report_id != report_id:
            raise NotFoundException("Versión no encontrada para este reporte.")

        if load_relations:
            return ReportVersionDetailRead.model_validate(version)

        return ReportVersionRead.model_validate(version)

    def get_versions_by_report(
        self,
        report_id: uuid.UUID,
        status: Optional[PublicationStatus] = None,
    ) -> list[ReportVersionRead]:
        """
        Obtiene todas las versiones de un reporte.

        Args:
            report_id: ID del reporte padre
            status: Filtrar por estado de publicación
        """
        # Validar que el reporte existe
        report = self.report_repository.get_by_id(report_id)
        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        versions = self.repository.get_by_report_id(report_id, status)

        return [ReportVersionRead.model_validate(version) for version in versions]

    def get_version_by_language(
        self,
        report_id: uuid.UUID,
        language: LanguageCode,
        status: Optional[PublicationStatus] = None,
    ) -> ReportVersionRead:
        """
        Obtiene una versión específica por idioma.

        Args:
            report_id: ID del reporte padre
            language: Código de idioma (ES, EN)
            status: Filtrar por estado de publicación
        """
        # Validar que el reporte existe
        report = self.report_repository.get_by_id(report_id)
        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        version = self.repository.get_by_language(report_id, language, status)

        if not version:
            raise NotFoundException(
                message=f"Versión en idioma {language.value} no encontrada.",
            )

        return ReportVersionRead.model_validate(version)

    def get_version_by_number(
        self,
        report_id: uuid.UUID,
        version: str,
        language: Optional[LanguageCode] = None,
    ) -> ReportVersionRead:
        """
        Obtiene una versión específica por número de versión.

        Args:
            report_id: ID del reporte padre
            version: Número de versión (ej: v1, v2)
            language: Filtrar por idioma (opcional)
        """
        # Validar que el reporte existe
        report = self.report_repository.get_by_id(report_id)
        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        version_obj = self.repository.get_by_version(report_id, version, language)

        if not version_obj:
            raise NotFoundException(
                message=f"Versión {version} no encontrada.",
            )

        return ReportVersionRead.model_validate(version_obj)

    def get_published_versions(self, report_id: uuid.UUID) -> list[ReportVersionRead]:
        """
        Obtiene todas las versiones publicadas de un reporte.

        Args:
            report_id: ID del reporte padre
        """
        # Validar que el reporte existe
        report = self.report_repository.get_by_id(report_id)
        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        versions = self.repository.get_published_versions(report_id)

        return [ReportVersionRead.model_validate(version) for version in versions]

    def create_version(
        self,
        report_id: uuid.UUID,
        data: ReportVersionCreate,
    ) -> ReportVersionRead:
        """
        Crea una nueva versión de reporte.

        Reglas:
        - El reporte debe existir.
        - No puede existir otra versión con el mismo número e idioma.
        """
        # Validar que el reporte existe
        report = self.report_repository.get_by_id(report_id)
        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        # Validar que no exista una versión con el mismo número e idioma
        if self.repository.exists_by_version_and_language(
            report_id, data.version, data.language
        ):
            raise ConflictException(
                message=f"Ya existe una versión {data.version} en idioma {data.language.value}.",
            )

        version = ReportVersion(
            report_id=report_id,
            title=data.title,
            version=data.version,
            language=data.language,
            summary=data.summary,
            citation_text=data.citation_text,
            status=data.status if data.status else PublicationStatus.DRAFT,
        )

        created_version = self.repository.create(version)

        return ReportVersionRead.model_validate(created_version)

    def update_version(
        self,
        report_id: uuid.UUID,
        version_id: uuid.UUID,
        data: ReportVersionUpdate,
    ) -> ReportVersionRead:
        """
        Actualiza parcialmente una versión de reporte.

        Reglas:
        - La versión debe existir.
        - Solo se pueden actualizar: title, summary, citation_text, status
        """
        version = self.repository.get_by_id(version_id)

        if not version:
            raise NotFoundException(
                message="Versión no encontrada.",
            )

        if version.report_id != report_id:
            raise NotFoundException("Versión no encontrada para este reporte.")

        update_data = data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(version, field, value)

        updated_version = self.repository.update(version)

        return ReportVersionRead.model_validate(updated_version)

    def delete_version(self, report_id: uuid.UUID, version_id: uuid.UUID) -> None:
        """
        Elimina una versión de reporte.

        Args:
            version_id: ID de la versión a eliminar
        """
        version = self.repository.get_by_id(version_id)

        if not version:
            raise NotFoundException(
                message="Versión no encontrada.",
            )

        if version.report_id != report_id:
            raise NotFoundException("Versión no encontrada para este reporte.")

        self.repository.delete(version)

    def get_full_report_by_version_and_language(
        self,
        report_id: uuid.UUID,
        version: str,
        language: LanguageCode,
    ) -> ReportVersionFullRead:
        """
        Obtiene un reporte completo (versión específica) con todas sus relaciones.
        """
        # Validar que el reporte existe
        report = self.report_repository.get_by_id(report_id)
        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )

        report_version = self.repository.get_full_report_by_version_and_language(
            report_id, version, language
        )

        if not report_version:
            raise NotFoundException(
                message=f"Versión {version} en idioma {language.value} no encontrada.",
            )

        return ReportVersionFullRead.model_validate(report_version)
