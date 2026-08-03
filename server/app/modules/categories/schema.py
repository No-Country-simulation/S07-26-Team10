import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    """
    Schema de entrada para crear una categoría.
    """

    report_id: uuid.UUID = Field(
        ...,
        description="ID del reporte al que pertenece la categoría",
    )

    name: str = Field(
        ...,
        description="Nombre de la categoría",
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        description="Descripción de la categoría",
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación de la categoría",
    )

    published: bool = Field(
        default=True,
        description="Estado de publicación de la categoría",
    )


class CategoryUpdate(BaseModel):
    """
    Schema de entrada para actualizar una categoría parcialmente.
    """

    name: str | None = Field(
        default=None,
        description="Nombre de la categoría",
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        description="Descripción de la categoría",
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación de la categoría",
    )

    published: bool | None = Field(
        default=None,
        description="Estado de publicación de la categoría",
    )


class CategoryRead(BaseModel):
    """
    Schema de salida completo para una categoría (contexto administrativo).
    """

    id: uuid.UUID

    report_id: uuid.UUID

    name: str

    description: str | None = None

    display_order: int | None = None

    published: bool

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class CategoryPublicRead(BaseModel):
    """
    Schema de salida público para una categoría (sin timestamps ni published).
    """

    id: uuid.UUID

    report_id: uuid.UUID

    name: str

    description: str | None = None

    display_order: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )
