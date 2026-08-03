from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


def seed_admin() -> None:
    """
    Crea el usuario administrador inicial si no existe.
    """

    db: Session = SessionLocal()

    try:
        repository = UserRepository(db)

        existing = repository.get_by_email(
            "admin@physaflow.com",
        )

        if existing:
            print("✔ El usuario administrador ya existe.")
            return

        admin = User(
            name="Administrador",
            email="admin@physaflow.com",
            password=hash_password("Admin123*"),
            is_active=True,
        )

        repository.create(admin)

        print("✔ Usuario administrador creado correctamente.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()