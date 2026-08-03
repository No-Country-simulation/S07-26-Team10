import uuid
from collections.abc import Generator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.exceptions import UnauthorizedException
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_user_repository(
    db: Session = Depends(get_db),
) -> UserRepository:
    """
    Provee una instancia de UserRepository.
    """
    return UserRepository(db)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    repository: UserRepository = Depends(get_user_repository),
) -> User:
    """
    Obtiene el usuario autenticado a partir del JWT.
    """

    token = credentials.credentials

    payload = decode_access_token(token)

    sub = payload.get("sub")

    if sub is None:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    user = repository.get_by_id(user_id)

    if user is None:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    if not user.is_active:
        raise UnauthorizedException(
            message="Usuario inactivo.",
        )

    return user