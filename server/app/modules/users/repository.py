import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.modules.roles.model import Role
from app.modules.users.model import User


class UserRepository:
    """Repositorio de acceso a datos para usuarios."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_all(self) -> list[User]:
        """Obtiene todos los usuarios con su rol."""

        stmt = (
            select(User)
            .options(joinedload(User.role))
            .order_by(User.created_at.desc())
        )

        return list(self.db.execute(stmt).scalars().unique())

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Obtiene un usuario por ID, incluyendo su rol."""

        stmt = (
            select(User)
            .options(joinedload(User.role))
            .where(User.id == user_id)
        )

        return self.db.execute(stmt).scalars().first()

    def get_by_email(self, email: str) -> User | None:
        """Obtiene un usuario por email, incluyendo su rol."""

        stmt = (
            select(User)
            .options(joinedload(User.role))
            .where(User.email == email)
        )

        return self.db.execute(stmt).scalars().first()

    def role_exists(self, role_id: uuid.UUID) -> bool:
        """Verifica que un rol exista por su ID."""

        stmt = select(Role.id).where(Role.id == role_id)

        return self.db.execute(stmt).scalars().first() is not None

    def create(self, user: User) -> User:
        """Persiste un nuevo usuario en la base de datos."""

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        stmt = (
            select(User)
            .options(joinedload(User.role))
            .where(User.id == user.id)
        )

        return self.db.execute(stmt).scalars().first()  # type: ignore

    def update(self, user: User) -> User:
        """Actualiza un usuario existente en la base de datos."""

        self.db.commit()
        self.db.refresh(user)

        stmt = (
            select(User)
            .options(joinedload(User.role))
            .where(User.id == user.id)
        )

        return self.db.execute(stmt).scalars().first()  # type: ignore

    def delete(self, user: User) -> None:
        """Elimina un usuario de la base de datos (hard delete)."""

        self.db.delete(user)
        self.db.commit()
