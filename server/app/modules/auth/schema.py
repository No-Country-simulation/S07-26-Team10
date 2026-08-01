import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema de entrada para el endpoint de login."""

    email: EmailStr = Field(
        ...,
        description="Email del usuario",
        max_length=150,
    )
    password: str = Field(
        ...,
        description="Contraseña del usuario",
        min_length=1,
    )


class TokenResponse(BaseModel):
    """Schema de respuesta con el token de acceso."""

    access_token: str
    token_type: str


class RoleRead(BaseModel):
    """Schema de salida para el rol del usuario."""

    id: uuid.UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(BaseModel):
    """Schema de salida para el usuario autenticado."""

    id: uuid.UUID
    name: str
    email: str
    is_active: bool
    role: RoleRead

    model_config = ConfigDict(from_attributes=True)
