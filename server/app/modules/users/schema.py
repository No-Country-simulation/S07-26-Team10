import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """
    Schema de entrada para crear un usuario.
    """

    name: str = Field(
        ...,
        description="Nombre del usuario",
        min_length=1,
        max_length=150,
    )

    email: EmailStr = Field(
        ...,
        description="Email del usuario",
        max_length=150,
    )

    password: str = Field(
        ...,
        description="Contraseña del usuario",
        min_length=8,
        max_length=128,
    )

    is_active: bool = Field(
        default=True,
        description="Estado activo del usuario",
    )


class UserUpdate(BaseModel):
    """
    Schema de entrada para actualizar un usuario parcialmente.
    """

    name: str | None = Field(
        default=None,
        description="Nombre del usuario",
        min_length=1,
        max_length=150,
    )

    email: EmailStr | None = Field(
        default=None,
        description="Email del usuario",
        max_length=150,
    )

    password: str | None = Field(
        default=None,
        description="Nueva contraseña del usuario",
        min_length=8,
        max_length=128,
    )

    is_active: bool | None = Field(
        default=None,
        description="Estado activo del usuario",
    )


class UserRead(BaseModel):
    """
    Schema de salida para un usuario.
    """

    id: uuid.UUID

    name: str

    email: EmailStr

    is_active: bool

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )