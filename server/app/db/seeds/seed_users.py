from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


def seed_users(db: Session) -> None:
    """
    Crea usuarios de prueba si no existen.
    """
    repository = UserRepository(db)

    # 1. Admin
    admin = repository.get_by_email("admin@physaflow.com")
    if not admin:
        admin = User(
            name="Administrador",
            email="admin@physaflow.com",
            password=hash_password("Admin123*"),
            is_active=True,
        )
        repository.create(admin)
        print("✔ Usuario administrador creado.")
