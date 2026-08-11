from sqlalchemy.orm import Session

from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.reports.repository import ReportRepository
from app.modules.resources.model import Resource
from app.modules.resources.repository import ResourceRepository
from app.modules.sections.repository import SectionRepository
from app.shared.enums.resource_type import ResourceType
from app.shared.enums.language_code import LanguageCode


def seed_resources(db: Session) -> None:
    """
    Crea recursos (imágenes) para cada sección publicada del reporte.
    Usa imágenes de placeholder de picsum.photos.
    """
    report_repository = ReportRepository(db)
    version_repository = ReportVersionRepository(db)
    section_repository = SectionRepository(db)
    resource_repository = ResourceRepository(db)

    # Obtener el reporte
    report = report_repository.get_by_slug("stranded-capacity-index-2026")
    if not report:
        print("⚠️ Reporte no encontrado. Ejecuta seed_reports primero.")
        return

    # Obtener versiones PUBLICADAS (v2 ES y v2 EN)
    versions = version_repository.get_by_report_id(report.id)
    published_versions = [v for v in versions if v.status == "PUBLISHED"]

    # IDs de imágenes de picsum (1 por sección)
    image_ids = [
        91,
        92,
        93,
        94,
        95,
        96,
        98,
        99,
        100,
        101,  # 10 imágenes
    ]

    # Para cada versión publicada, obtener sus secciones y crear recursos
    for version in published_versions:
        # Obtener secciones de esta versión
        sections = section_repository.get_by_report_version_id(version.id)

        for idx, section in enumerate(sections):
            # Usar image_id según índice, cíclico si hay más secciones que imágenes
            image_id = image_ids[idx % len(image_ids)]

            # Verificar si la sección ya tiene recursos
            existing_resources = resource_repository.get_by_section_id(section.id)
            if existing_resources:
                continue

            # Crear recurso IMAGE
            resource = Resource(
                section_id=section.id,
                type=ResourceType.IMAGE,
                title=f"Imagen ilustrativa: {section.title}",
                description=f"Visualización conceptual para la sección '{section.title}' del Stranded Capacity Index.",
                file_url=f"https://picsum.photos/id/{image_id}/800/600",
                cloudinary_public_id=f"physaflow/images/seed-section-{str(section.id)[:8]}",
                alt_text=f"Ilustración para {section.title}",
                downloadable=True,
            )
            resource_repository.create(resource)

            print(
                f"✔ Recurso IMAGE creado para sección '{section.title}' (versión {version.version}, {version.language.value})"
            )
