from sqlalchemy.orm import Session

from app.modules.references.model import Reference
from app.modules.references.repository import ReferenceRepository
from app.modules.report_versions.repository import ReportVersionRepository
from app.modules.reports.repository import ReportRepository
from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus


def seed_references(db: Session) -> None:
    """
    Crea referencias bibliográficas en formato APA para cada versión del reporte.
    """
    report_repository = ReportRepository(db)
    version_repository = ReportVersionRepository(db)
    reference_repository = ReferenceRepository(db)

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

    # Definir referencias (ES)
    references_es = [
        {
            "authors": "Agencia Internacional de Energía (IEA)",
            "title": "Energy and AI – Executive Summary",
            "year": 2026,
            "source": "IEA",
            "citation_url": "https://www.iea.org/reports/energy-and-ai/executive-summary",
            "display_order": 1,
        },
        {
            "authors": "Agencia Internacional de Energía (IEA)",
            "title": "Energy demand from AI",
            "year": 2026,
            "source": "IEA",
            "citation_url": "https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai",
            "display_order": 2,
        },
        {
            "authors": "Agencia Internacional de Energía (IEA)",
            "title": "AI and energy security",
            "year": 2026,
            "source": "IEA",
            "citation_url": "https://www.iea.org/reports/energy-and-ai/ai-and-energy-security",
            "display_order": 3,
        },
        {
            "authors": "Uptime Institute",
            "title": "2024 Global Data Center Survey",
            "year": 2024,
            "source": "Uptime Institute",
            "citation_url": "https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf",
            "display_order": 4,
        },
        {
            "authors": "CBRE",
            "title": "Global Data Center Trends 2026",
            "year": 2026,
            "source": "CBRE",
            "citation_url": "https://www.cbre.com/insights/reports/global-data-center-trends-2026",
            "display_order": 5,
        },
        {
            "authors": "McKinsey & Company",
            "title": "The cost of compute: A $7 trillion race to scale data centers",
            "year": 2026,
            "source": "McKinsey",
            "citation_url": "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-cost-of-compute-a-7-trillion-dollar-race-to-scale-data-centers",
            "display_order": 6,
        },
        {
            "authors": "Sunbird DCIM",
            "title": "How to Find Stranded Capacity in Your Data Center",
            "year": 2023,
            "source": "Sunbird DCIM",
            "citation_url": "https://www.sunbirddcim.com/blog/how-find-stranded-capacity-your-data-center",
            "display_order": 7,
        },
        {
            "authors": "AKCP",
            "title": "Understanding Stranded Capacity",
            "year": 2022,
            "source": "AKCP",
            "citation_url": "https://www.akcp.com/2022/02/21/understanding-stranded-capacity",
            "display_order": 8,
        },
        {
            "authors": "Data Center Knowledge",
            "title": "Don't Leave Me Stranded: The Risk of Unused Data Center Assets",
            "year": 2023,
            "source": "Data Center Knowledge",
            "citation_url": "https://www.datacenterknowledge.com/security-and-risk-management/don-t-leave-me-stranded-the-risk-of-unused-data-center-assets",
            "display_order": 9,
        },
        {
            "authors": "Upsite Technologies",
            "title": "Cooling Capacity Factor (CCF) Reveals Stranded Capacity",
            "year": 2017,
            "source": "Upsite",
            "citation_url": "https://www.upsite.com/wp-content/uploads/2017/08/Cooling-Capacity-Factor-White-Paper.pdf",
            "display_order": 10,
        },
        {
            "authors": "Stanford University",
            "title": "The 2026 AI Index Report",
            "year": 2026,
            "source": "Stanford HAI",
            "citation_url": "https://hai.stanford.edu/ai-index/2026-ai-index-report",
            "display_order": 11,
        },
        {
            "authors": "Weng, Q., et al.",
            "title": "FGD: Fast GPU Scheduling for Deep Learning Clusters",
            "year": 2023,
            "source": "USENIX ATC",
            "citation_url": "https://www.usenix.org/system/files/atc23-weng.pdf",
            "display_order": 12,
        },
        {
            "authors": "Kubernetes Documentation",
            "title": "Cluster Architecture",
            "year": 2026,
            "source": "Kubernetes",
            "citation_url": "https://kubernetes.io/docs/concepts/architecture",
            "display_order": 13,
        },
        {
            "authors": "Kubernetes Documentation",
            "title": "Scheduling",
            "year": 2026,
            "source": "Kubernetes",
            "citation_url": "https://kubernetes.io/docs/concepts/scheduling-eviction",
            "display_order": 14,
        },
        {
            "authors": "Volcano Community",
            "title": "Volcano: Cloud Native Batch System",
            "year": 2026,
            "source": "Volcano",
            "citation_url": "https://volcano.sh",
            "display_order": 15,
        },
        {
            "authors": "Slurm Workload Manager",
            "title": "Slurm Documentation",
            "year": 2026,
            "source": "Slurm",
            "citation_url": "https://slurm.schedmd.com/documentation.html",
            "display_order": 16,
        },
        {
            "authors": "Schneider Electric",
            "title": "EcoStruxure IT DCIM Software",
            "year": 2026,
            "source": "Schneider Electric",
            "citation_url": "https://www.se.com/ww/en/work/software/data-center-infrastructure-management-dcim",
            "display_order": 17,
        },
        {
            "authors": "Sunbird DCIM",
            "title": "Do You Need DCIM Software If You Already Use a BMS?",
            "year": 2023,
            "source": "Sunbird DCIM",
            "citation_url": "https://www.sunbirddcim.com/blog/do-you-need-dcim-software-if-you-already-use-bms",
            "display_order": 18,
        },
        {
            "authors": "AWS",
            "title": "AWS Data Centers",
            "year": 2026,
            "source": "AWS",
            "citation_url": "https://aws.amazon.com/trust-center/data-center",
            "display_order": 19,
        },
        {
            "authors": "Next.js Documentation",
            "title": "App Router",
            "year": 2026,
            "source": "Next.js",
            "citation_url": "https://nextjs.org/docs/app",
            "display_order": 20,
        },
        {
            "authors": "MDX",
            "title": "MDX: Markdown for the component era",
            "year": 2026,
            "source": "MDX",
            "citation_url": "https://mdxjs.com",
            "display_order": 21,
        },
    ]

    # Definir referencias (EN) - traducción / adaptación
    references_en = [
        {
            "authors": "International Energy Agency (IEA)",
            "title": "Energy and AI – Executive Summary",
            "year": 2026,
            "source": "IEA",
            "citation_url": "https://www.iea.org/reports/energy-and-ai/executive-summary",
            "display_order": 1,
        },
        {
            "authors": "International Energy Agency (IEA)",
            "title": "Energy demand from AI",
            "year": 2026,
            "source": "IEA",
            "citation_url": "https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai",
            "display_order": 2,
        },
        {
            "authors": "International Energy Agency (IEA)",
            "title": "AI and energy security",
            "year": 2026,
            "source": "IEA",
            "citation_url": "https://www.iea.org/reports/energy-and-ai/ai-and-energy-security",
            "display_order": 3,
        },
        {
            "authors": "Uptime Institute",
            "title": "2024 Global Data Center Survey",
            "year": 2024,
            "source": "Uptime Institute",
            "citation_url": "https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf",
            "display_order": 4,
        },
        {
            "authors": "CBRE",
            "title": "Global Data Center Trends 2026",
            "year": 2026,
            "source": "CBRE",
            "citation_url": "https://www.cbre.com/insights/reports/global-data-center-trends-2026",
            "display_order": 5,
        },
        {
            "authors": "McKinsey & Company",
            "title": "The cost of compute: A $7 trillion race to scale data centers",
            "year": 2026,
            "source": "McKinsey",
            "citation_url": "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-cost-of-compute-a-7-trillion-dollar-race-to-scale-data-centers",
            "display_order": 6,
        },
        {
            "authors": "Sunbird DCIM",
            "title": "How to Find Stranded Capacity in Your Data Center",
            "year": 2023,
            "source": "Sunbird DCIM",
            "citation_url": "https://www.sunbirddcim.com/blog/how-find-stranded-capacity-your-data-center",
            "display_order": 7,
        },
        {
            "authors": "AKCP",
            "title": "Understanding Stranded Capacity",
            "year": 2022,
            "source": "AKCP",
            "citation_url": "https://www.akcp.com/2022/02/21/understanding-stranded-capacity",
            "display_order": 8,
        },
        {
            "authors": "Data Center Knowledge",
            "title": "Don't Leave Me Stranded: The Risk of Unused Data Center Assets",
            "year": 2023,
            "source": "Data Center Knowledge",
            "citation_url": "https://www.datacenterknowledge.com/security-and-risk-management/don-t-leave-me-stranded-the-risk-of-unused-data-center-assets",
            "display_order": 9,
        },
        {
            "authors": "Upsite Technologies",
            "title": "Cooling Capacity Factor (CCF) Reveals Stranded Capacity",
            "year": 2017,
            "source": "Upsite",
            "citation_url": "https://www.upsite.com/wp-content/uploads/2017/08/Cooling-Capacity-Factor-White-Paper.pdf",
            "display_order": 10,
        },
        {
            "authors": "Stanford University",
            "title": "The 2026 AI Index Report",
            "year": 2026,
            "source": "Stanford HAI",
            "citation_url": "https://hai.stanford.edu/ai-index/2026-ai-index-report",
            "display_order": 11,
        },
        {
            "authors": "Weng, Q., et al.",
            "title": "FGD: Fast GPU Scheduling for Deep Learning Clusters",
            "year": 2023,
            "source": "USENIX ATC",
            "citation_url": "https://www.usenix.org/system/files/atc23-weng.pdf",
            "display_order": 12,
        },
        {
            "authors": "Kubernetes Documentation",
            "title": "Cluster Architecture",
            "year": 2026,
            "source": "Kubernetes",
            "citation_url": "https://kubernetes.io/docs/concepts/architecture",
            "display_order": 13,
        },
        {
            "authors": "Kubernetes Documentation",
            "title": "Scheduling",
            "year": 2026,
            "source": "Kubernetes",
            "citation_url": "https://kubernetes.io/docs/concepts/scheduling-eviction",
            "display_order": 14,
        },
        {
            "authors": "Volcano Community",
            "title": "Volcano: Cloud Native Batch System",
            "year": 2026,
            "source": "Volcano",
            "citation_url": "https://volcano.sh",
            "display_order": 15,
        },
        {
            "authors": "Slurm Workload Manager",
            "title": "Slurm Documentation",
            "year": 2026,
            "source": "Slurm",
            "citation_url": "https://slurm.schedmd.com/documentation.html",
            "display_order": 16,
        },
        {
            "authors": "Schneider Electric",
            "title": "EcoStruxure IT DCIM Software",
            "year": 2026,
            "source": "Schneider Electric",
            "citation_url": "https://www.se.com/ww/en/work/software/data-center-infrastructure-management-dcim",
            "display_order": 17,
        },
        {
            "authors": "Sunbird DCIM",
            "title": "Do You Need DCIM Software If You Already Use a BMS?",
            "year": 2023,
            "source": "Sunbird DCIM",
            "citation_url": "https://www.sunbirddcim.com/blog/do-you-need-dcim-software-if-you-already-use-bms",
            "display_order": 18,
        },
        {
            "authors": "AWS",
            "title": "AWS Data Centers",
            "year": 2026,
            "source": "AWS",
            "citation_url": "https://aws.amazon.com/trust-center/data-center",
            "display_order": 19,
        },
        {
            "authors": "Next.js Documentation",
            "title": "App Router",
            "year": 2026,
            "source": "Next.js",
            "citation_url": "https://nextjs.org/docs/app",
            "display_order": 20,
        },
        {
            "authors": "MDX",
            "title": "MDX: Markdown for the component era",
            "year": 2026,
            "source": "MDX",
            "citation_url": "https://mdxjs.com",
            "display_order": 21,
        },
    ]

    # Crear referencias para versiones ES
    for version in versions_es:
        for ref_data in references_es:
            # Verificar si la referencia ya existe
            existing = (
                db.query(Reference)
                .filter(
                    Reference.report_version_id == version.id,
                    Reference.title == ref_data["title"],
                )
                .first()
            )

            if not existing:
                reference = Reference(
                    report_version_id=version.id,
                    authors=ref_data["authors"],
                    title=ref_data["title"],
                    year=ref_data["year"],
                    source=ref_data["source"],
                    citation_url=ref_data["citation_url"],
                    display_order=ref_data["display_order"],
                )
                reference_repository.create(reference)
                print(
                    f"✔ Referencia '{ref_data['title'][:50]}...' creada para versión {version.version} ({version.language.value})"
                )

    # Crear referencias para versiones EN
    for version in versions_en:
        for ref_data in references_en:

            existing = (
                db.query(Reference)
                .filter(
                    Reference.report_version_id == version.id,
                    Reference.title == ref_data["title"],
                )
                .first()
            )

            if not existing:
                reference = Reference(
                    report_version_id=version.id,
                    authors=ref_data["authors"],
                    title=ref_data["title"],
                    year=ref_data["year"],
                    source=ref_data["source"],
                    citation_url=ref_data["citation_url"],
                    display_order=ref_data["display_order"],
                )
                reference_repository.create(reference)
                print(
                    f"✔ Referencia '{ref_data['title'][:50]}...' creada para versión {version.version} ({version.language.value})"
                )
