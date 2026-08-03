import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReferenceCreate(BaseModel):
    """
    Schema de entrada para crear una referencia.
    """

    report_id: uuid.UUID = Field(
        ...,
        description="ID del reporte al que pertenece la referencia",
    )

    authors: str | None = Field(
        default=None,
        description="Autores de la referencia",
        max_length=255,
    )

    title: str | None = Field(
        default=None,
        description="Título de la referencia",
        max_length=255,
    )

    year: int | None = Field(
        default=None,
        description="Año de publicación",
    )

    source: str | None = Field(
        default=None,
        description="Fuente de la referencia",
        max_length=255,
    )

    citation_url: str | None = Field(
        default=None,
        description="URL de citación",
        max_length=500,
    )


class ReferenceUpdate(BaseModel):
    """
    Schema de entrada para actualizar una referencia parcialmente.
    """

    authors: str | None = Field(
        default=None,
        description="Autores de la referencia",
        max_length=255,
    )

    title: str | None = Field(
        default=None,
        description="Título de la referencia",
        max_length=255,
    )

    year: int | None = Field(
        default=None,
        description="Año de publicación",
    )

    source: str | None = Field(
        default=None,
        description="Fuente de la referencia",
        max_length=255,
    )

    citation_url: str | None = Field(
        default=None,
        description="URL de citación",
        max_length=500,
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación",
    )


class ReferenceRead(BaseModel):
    """
    Schema de salida completo para una referencia (contexto administrativo).
    """

    id: uuid.UUID

    report_id: uuid.UUID

    authors: str | None = None

    title: str | None = None

    year: int | None = None

    source: str | None = None

    citation_url: str | None = None

    display_order: int | None = None

    created_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReferencePublicRead(BaseModel):
    """
    Schema de salida público para una referencia (sin timestamps).
    """

    id: uuid.UUID

    report_id: uuid.UUID

    authors: str | None = None

    title: str | None = None

    year: int | None = None

    source: str | None = None

    citation_url: str | None = None

    display_order: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )
