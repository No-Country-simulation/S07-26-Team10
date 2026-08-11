from sqlalchemy.orm import Session

from app.modules.categories.repository import CategoryRepository
from app.modules.concepts.model import Concept
from app.modules.concepts.repository import ConceptRepository
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.reports.repository import ReportRepository
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


def seed_concepts(db: Session) -> None:
    """
    Crea conceptos para cada categoría de la taxonomía.
    Los conceptos son términos clave que definen cada categoría.
    """
    report_repository = ReportRepository(db)
    version_repository = ReportVersionRepository(db)
    category_repository = CategoryRepository(db)
    concept_repository = ConceptRepository(db)

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

    # Definir conceptos por categoría (ES)
    concepts_es = {
        "Facility": [
            {
                "name": "Stranded Power",
                "description": "Capacidad eléctrica contratada o UPS disponible que no puede soportar nueva carga crítica por desbalances en distribución o derating conservador.",
                "display_order": 1,
            },
            {
                "name": "Stranded Cooling",
                "description": "Capacidad térmica activa que no enfría IT útil debido a bypass air, sobreenfriamiento, falta de contención o mala distribución.",
                "display_order": 2,
            },
            {
                "name": "Infrastructure Constraints",
                "description": "Cuellos de botella en distribución eléctrica (PDU, breakers), redundancia rígida (N+1/2N) y espacio físico no utilizable.",
                "display_order": 3,
            },
        ],
        "IT": [
            {
                "name": "GPU Fragmentation",
                "description": "GPUs libres pero no asignables por partición parcial, shares incompatibles o demandas multi-GPU que no pueden satisfacerse.",
                "display_order": 1,
            },
            {
                "name": "Installed but Unavailable",
                "description": "Servidores o GPUs instalados pero fuera de servicio por fallas, mantenimiento o integración incompleta al pool de scheduling.",
                "display_order": 2,
            },
            {
                "name": "Topology Bottlenecks",
                "description": "Aceleradores presentes pero no aptos para ciertos entrenamientos por restricciones de red, localidad de datos o islas de bajo ancho de banda.",
                "display_order": 3,
            },
        ],
        "Workload": [
            {
                "name": "Scheduler Fragmentation",
                "description": "Jobs en cola con capacidad libre agregada pero no asignable por bin packing deficiente o incompatibilidad de shares.",
                "display_order": 1,
            },
            {
                "name": "Gang Scheduling",
                "description": "Trabajos distribuidos que no pueden coasignar todos los nodos requeridos, impidiendo su ejecución.",
                "display_order": 2,
            },
            {
                "name": "Queue Inefficiency",
                "description": "Largas demoras de espera con baja utilización efectiva por políticas FIFO rígidas o prioridades pobres.",
                "display_order": 3,
            },
        ],
    }

    # Definir conceptos por categoría (EN)
    concepts_en = {
        "Facility": [
            {
                "name": "Stranded Power",
                "description": "Contracted power or available UPS that cannot support new critical load due to distribution imbalances or conservative derating.",
                "display_order": 1,
            },
            {
                "name": "Stranded Cooling",
                "description": "Active thermal capacity that does not cool useful IT due to bypass air, overcooling, lack of containment, or poor distribution.",
                "display_order": 2,
            },
            {
                "name": "Infrastructure Constraints",
                "description": "Bottlenecks in electrical distribution (PDU, breakers), rigid redundancy (N+1/2N), and unusable physical space.",
                "display_order": 3,
            },
        ],
        "IT": [
            {
                "name": "GPU Fragmentation",
                "description": "Free GPUs that cannot be assigned due to partial partitioning, incompatible shares, or unsatisfiable multi-GPU demands.",
                "display_order": 1,
            },
            {
                "name": "Installed but Unavailable",
                "description": "Servers or GPUs installed but out of service due to failures, maintenance, or incomplete integration into the scheduling pool.",
                "display_order": 2,
            },
            {
                "name": "Topology Bottlenecks",
                "description": "Accelerators present but unsuitable for certain training due to network constraints, data locality, or low-bandwidth islands.",
                "display_order": 3,
            },
        ],
        "Workload": [
            {
                "name": "Scheduler Fragmentation",
                "description": "Jobs in queue with aggregate free capacity but unassignable due to poor bin packing or incompatible shares.",
                "display_order": 1,
            },
            {
                "name": "Gang Scheduling",
                "description": "Distributed jobs that cannot co-allocate all required nodes, preventing execution.",
                "display_order": 2,
            },
            {
                "name": "Queue Inefficiency",
                "description": "Long wait times with low effective utilization due to rigid FIFO policies or poor priorities.",
                "display_order": 3,
            },
        ],
    }

    # Crear conceptos para versiones ES
    for version in versions_es:
        # Obtener categorías de esta versión
        categories = category_repository.get_by_report_version_id(version.id)

        for category in categories:
            # Obtener conceptos para esta categoría
            category_concepts = concepts_es.get(category.name, [])
            for concept_data in category_concepts:
                # Verificar si el concepto ya existe
                existing = concept_repository.exists_by_name(
                    category.id, concept_data["name"]
                )
                if not existing:
                    concept = Concept(
                        category_id=category.id,
                        name=concept_data["name"],
                        description=concept_data["description"],
                        display_order=concept_data["display_order"],
                    )
                    concept_repository.create(concept)
                    print(
                        f"✔ Concepto '{concept_data['name']}' creado para categoría '{category.name}' ({version.version}, {version.language.value})"
                    )

    # Crear conceptos para versiones EN
    for version in versions_en:
        categories = category_repository.get_by_report_version_id(version.id)

        for category in categories:
            category_concepts = concepts_en.get(category.name, [])
            for concept_data in category_concepts:
                existing = concept_repository.exists_by_name(
                    category.id, concept_data["name"]
                )
                if not existing:
                    concept = Concept(
                        category_id=category.id,
                        name=concept_data["name"],
                        description=concept_data["description"],
                        display_order=concept_data["display_order"],
                    )
                    concept_repository.create(concept)
                    print(
                        f"✔ Concepto '{concept_data['name']}' creado para categoría '{category.name}' ({version.version}, {version.language.value})"
                    )
