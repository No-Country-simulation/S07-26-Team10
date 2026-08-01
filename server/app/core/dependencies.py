import uuid
from collections.abc import Generator

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.constants import ADMIN_ROLE_NAME
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.exceptions import ForbiddenException, UnauthorizedException
from app.modules.users.model import User
from app.modules.users.repository import UserRepository


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependencia que extrae y valida el usuario autenticado desde el token JWT.

    Lanza UnauthorizedException si:
    - El token es inválido o expirado.
    - El payload no contiene un subject válido.
    - El usuario no existe en la base de datos.
    - El usuario está inactivo.
    """

    payload = decode_access_token(token)

    sub: str | None = payload.get("sub")

    if not sub:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    repository = UserRepository(db)
    user = repository.get_by_id(user_id)

    if not user:
        raise UnauthorizedException(
            message="Token inválido o expirado.",
        )

    if not user.is_active:
        raise UnauthorizedException(
            message="Usuario inactivo.",
        )

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependencia que verifica que el usuario autenticado tenga rol de administrador.

    Lanza ForbiddenException si el rol no es admin.
    """

    if current_user.role.name != ADMIN_ROLE_NAME:
        raise ForbiddenException(
            message="No tiene permisos para realizar esta acción.",
        )

    return current_user
