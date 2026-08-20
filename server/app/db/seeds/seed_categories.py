from sqlalchemy.orm import Session

from app.modules.categories.model import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.reports.repository import ReportRepository
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


def seed_categories(db: Session) -> None:
    """
    Crea categorías de la taxonomía para cada versión del reporte.
    Las categorías son independientes de las secciones.
    """
    report_repository = ReportRepository(db)
    version_repository = ReportVersionRepository(db)
    category_repository = CategoryRepository(db)

    # Obtener el reporte
    report = report_repository.get_by_slug("stranded-capacity-index-2026")
    if not report:
        print("⚠️ Reporte no encontrado. Ejecuta seed_reports primero.")
        return

    # Obtener versiones del reporte
    versions = version_repository.get_by_report_id(report.id)

    # Filtrar versiones por idioma
    versions_es = [v for v in versions if v.language == LanguageCode.ES]
    versions_en = [v for v in versions if v.language == LanguageCode.EN]

    # Definir categorías de la taxonomía (ES)
    categories_es = [
        {
            "name": "Facility",
            "description": "Energía, refrigeración, espacio y distribución eléctrica. Capacidad que queda atrapada por desbalances entre power, cooling y space.",
            "display_order": 1,
        },
        {
            "name": "IT",
            "description": "Servidores, GPUs, almacenamiento y red. Capacidad que no se traduce en cómputo útil por fragmentación, fallas o restricciones topológicas.",
            "display_order": 2,
        },
        {
            "name": "Workload",
            "description": "Scheduling, colas, fragmentación y ejecución de jobs. Capacidad que no produce output útil por ineficiencias en la capa de software.",
            "display_order": 3,
        },
    ]

    # Definir categorías de la taxonomía (EN)
    categories_en = [
        {
            "name": "Facility",
            "description": "Energy, cooling, space and electrical distribution. Capacity trapped by imbalances between power, cooling and space.",
            "display_order": 1,
        },
        {
            "name": "IT",
            "description": "Servers, GPUs, storage and networking. Capacity that does not translate into useful compute due to fragmentation, failures or topological constraints.",
            "display_order": 2,
        },
        {
            "name": "Workload",
            "description": "Scheduling, queues, fragmentation and job execution. Capacity that does not produce useful output due to inefficiencies in the software layer.",
            "display_order": 3,
        },
    ]

    # Crear categorías para versiones ES
    for version in versions_es:
        section_status = (
            PublicationStatus.PUBLISHED
            if version.status == PublicationStatus.PUBLISHED
            else PublicationStatus.DRAFT
        )

        for cat_data in categories_es:
            # Verificar si la categoría ya existe
            existing = category_repository.exists_by_name(version.id, cat_data["name"])

            if not existing:
                category = Category(
                    report_version_id=version.id,
                    name=cat_data["name"],
                    description=cat_data["description"],
                    display_order=cat_data["display_order"],
                    status=section_status,
                )
                category_repository.create(category)
                print(
                    f"✔ Categoría '{cat_data['name']}' creada para versión {version.version} ({version.language.value}) - {section_status.value}"
                )

    # Crear categorías para versiones EN
    for version in versions_en:
        section_status = (
            PublicationStatus.PUBLISHED
            if version.status == PublicationStatus.PUBLISHED
            else PublicationStatus.DRAFT
        )

        for cat_data in categories_en:
            existing = category_repository.exists_by_name(version.id, cat_data["name"])

            if not existing:
                category = Category(
                    report_version_id=version.id,
                    name=cat_data["name"],
                    description=cat_data["description"],
                    display_order=cat_data["display_order"],
                    status=section_status,
                )
                category_repository.create(category)
                print(
                    f"✔ Categoría '{cat_data['name']}' creada para versión {version.version} ({version.language.value}) - {section_status.value}"
                )
