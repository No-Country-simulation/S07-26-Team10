import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.users.model import User


class UserRepository:
    """
    Repositorio de acceso a datos para usuarios.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """
        Obtiene un usuario por ID.
        """

        stmt = (
            select(User)
            .where(User.id == user_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_by_email(self, email: str) -> User | None:
        """
        Obtiene un usuario por email.
        """

        stmt = (
            select(User)
            .where(User.email == email)
        )

        return self.db.execute(stmt).scalars().first()


    def create(self, user: User) -> User:
        """
        Crea un usuario.
        """

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user


    def update(self, user: User) -> User:
        """
        Actualiza un usuario.
        """

        self.db.commit()
        self.db.refresh(user)

        return user