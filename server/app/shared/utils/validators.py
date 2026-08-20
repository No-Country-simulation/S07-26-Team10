# app/shared/utils/validators.py
from app.exceptions import NotFoundException
from app.modules.report_versions.repository import ReportVersionRepository
from app.shared.enums.publication_status import PublicationStatus
import uuid


def validate_report_version_exists(
    report_version_id: uuid.UUID,
    report_version_repository: ReportVersionRepository,
) -> None:
    """
    Valida que la versión del reporte exista.
    """
    report_version = report_version_repository.get_by_id(report_version_id)

    if not report_version:
        raise NotFoundException(message="Versión de reporte no encontrada.")


def validate_report_version_published(
    report_version_id: uuid.UUID,
    report_version_repository: ReportVersionRepository,
) -> None:
    """
    Valida que la versión del reporte exista y esté PUBLICADA.
    """
    report_version = report_version_repository.get_by_id(report_version_id)

    if not report_version:
        raise NotFoundException(message="Versión de reporte no encontrada.")

    if report_version.status != PublicationStatus.PUBLISHED:
        raise NotFoundException(message="Versión de reporte no disponible.")
