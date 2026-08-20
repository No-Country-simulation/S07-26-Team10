from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.db.seeds.seed_users import seed_users
from app.db.seeds.seed_reports import seed_reports
from app.db.seeds.seed_report_versions import seed_report_versions
from app.db.seeds.seed_categories import seed_categories
from app.db.seeds.seed_sections import seed_sections
from app.db.seeds.seed_references import seed_references
from app.db.seeds.seed_concepts import seed_concepts
from app.db.seeds.seed_resources import seed_resources

# Importar más seeds a medida que los creemos


def run_seeds() -> None:
    """
    Ejecuta todos los seeds en orden.
    """
    db: Session = SessionLocal()

    try:
        print("🌱 Iniciando seeds...")

        seed_users(db)
        seed_reports(db)
        seed_report_versions(db)
        seed_categories(db)
        seed_sections(db)
        seed_references(db)
        seed_concepts(db)
        seed_resources(db)

        print("✅ Seeds completados.")

    except Exception as e:
        print(f"❌ Error en seed: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    run_seeds()
