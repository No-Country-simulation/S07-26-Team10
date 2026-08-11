from sqlalchemy.orm import Session

from app.modules.report_versions.model import ReportVersion
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.reports.repository import ReportRepository
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


def seed_report_versions(db: Session) -> None:
    """
    Crea versiones de prueba para cada reporte.
    - 2 versiones por reporte (ES y EN)
    - Versiones DRAFT y PUBLISHED
    """
    report_repository = ReportRepository(db)
    version_repository = ReportVersionRepository(db)

    # Obtener los reportes existentes
    report_1 = report_repository.get_by_slug("stranded-capacity-index-2026")

    if not report_1:
        print("⚠️ Reportes no encontrados. Ejecuta seed_reports primero.")
        return

    # ============================================================
    # REPORTE 1: Stranded Capacity Index 2026
    # ============================================================

    # Versión v1 - ES (DRAFT - versión anterior)
    if not version_repository.exists_by_version_and_language(
        report_1.id, "v1", LanguageCode.ES
    ):
        version_1_es = ReportVersion(
            report_id=report_1.id,
            title="Índice de Capacidad Varada 2026",
            version="v1",
            language=LanguageCode.ES,
            summary="Una introducción al concepto de capacidad varada en data centers de IA. Definición, contexto y primeras observaciones.",
            citation_text="PhysaFlow. (2026). Índice de Capacidad Varada 2026 (v1, ES). PhysaFlow.",
            status=PublicationStatus.DRAFT,
        )
        version_repository.create(version_1_es)
        print("✔ Reporte 1 - v1 (ES) DRAFT creado.")

    # Versión v1 - EN (DRAFT)
    if not version_repository.exists_by_version_and_language(
        report_1.id, "v1", LanguageCode.EN
    ):
        version_1_en = ReportVersion(
            report_id=report_1.id,
            title="Stranded Capacity Index 2026",
            version="v1",
            language=LanguageCode.EN,
            summary="An introduction to the concept of stranded capacity in AI data centers. Definition, context and early observations.",
            citation_text="PhysaFlow. (2026). Stranded Capacity Index 2026 (v1, EN). PhysaFlow.",
            status=PublicationStatus.DRAFT,
        )
        version_repository.create(version_1_en)
        print("✔ Reporte 1 - v1 (EN) DRAFT creado.")

    # Versión v2 - ES (PUBLISHED - versión actual)
    if not version_repository.exists_by_version_and_language(
        report_1.id, "v2", LanguageCode.ES
    ):
        version_2_es = ReportVersion(
            report_id=report_1.id,
            title="Índice de Capacidad Varada 2026",
            version="v2",
            language=LanguageCode.ES,
            summary="El índice completo de capacidad varada: taxonomía, métricas y análisis de impacto en la infraestructura de IA.",
            citation_text="PhysaFlow. (2026). Índice de Capacidad Varada 2026 (v2, ES). PhysaFlow.",
            status=PublicationStatus.PUBLISHED,
        )
        version_repository.create(version_2_es)
        print("✔ Reporte 1 - v2 (ES) PUBLISHED creado.")

    # Versión v2 - EN (PUBLISHED)
    if not version_repository.exists_by_version_and_language(
        report_1.id, "v2", LanguageCode.EN
    ):
        version_2_en = ReportVersion(
            report_id=report_1.id,
            title="Stranded Capacity Index 2026",
            version="v2",
            language=LanguageCode.EN,
            summary="The complete stranded capacity index: taxonomy, metrics and impact analysis on AI infrastructure.",
            citation_text="PhysaFlow. (2026). Stranded Capacity Index 2026 (v2, EN). PhysaFlow.",
            status=PublicationStatus.PUBLISHED,
        )
        version_repository.create(version_2_en)
        print("✔ Reporte 1 - v2 (EN) PUBLISHED creado.")
