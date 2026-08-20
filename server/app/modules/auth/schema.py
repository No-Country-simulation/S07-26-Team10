import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    """
    Schema de entrada para autenticación.
    """

    email: EmailStr = Field(
        ...,
        description="Email del usuario.",
        max_length=150,
    )

    password: str = Field(
        ...,
        description="Contraseña del usuario.",
        min_length=8,
        max_length=128,
    )


class TokenResponse(BaseModel):
    """
    Schema de respuesta con el token JWT.
    """

    access_token: str = Field(
        ...,
        description="JWT de acceso.",
    )

    token_type: str = Field(
        default="bearer",
        description="Tipo de token.",
    )


class CurrentUserResponse(BaseModel):
    """
    Schema de salida del usuario autenticado.
    """

    id: uuid.UUID

    name: str

    email: EmailStr

    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )