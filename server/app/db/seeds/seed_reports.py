import uuid
from sqlalchemy.orm import Session

from app.modules.reports.model import Report
from app.modules.reports.repository import ReportRepository


def seed_reports(db: Session) -> None:
    """
    Crea reportes de prueba para el Stranded Capacity Index.
    """
    repository = ReportRepository(db)

    # Reporte 1: Stranded Capacity Index 2026
    report_1 = repository.get_by_slug("stranded-capacity-index-2026")
    if not report_1:
        report_1 = Report(
            slug="stranded-capacity-index-2026",
        )
        repository.create(report_1)
        print("✔ Reporte 'Stranded Capacity Index 2026' creado.")
