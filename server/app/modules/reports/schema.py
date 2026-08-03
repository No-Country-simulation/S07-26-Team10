import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    """
    Schema de entrada para crear un reporte.
    """

    title: str = Field(
        ...,
        description="Título del reporte",
        min_length=1,
        max_length=255,
    )

    summary: str | None = Field(
        default=None,
        description="Resumen del reporte para la página de inicio",
    )

    citation_text: str | None = Field(
        default=None,
        description="Texto de citación del reporte",
    )


class ReportUpdate(BaseModel):
    """
    Schema de entrada para actualizar un reporte parcialmente.
    """

    title: str | None = Field(
        default=None,
        description="Título del reporte",
        min_length=1,
        max_length=255,
    )

    summary: str | None = Field(
        default=None,
        description="Resumen del reporte para la página de inicio",
    )

    citation_text: str | None = Field(
        default=None,
        description="Texto de citación del reporte",
    )


class ReportRead(BaseModel):
    """
    Schema de salida completo para un reporte (contexto administrativo).
    """

    id: uuid.UUID

    title: str

    slug: str

    summary: str | None = None

    citation_text: str | None = None

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReportPublicRead(BaseModel):
    """
    Schema de salida público para un reporte (sin timestamps internos).
    """

    id: uuid.UUID

    title: str

    slug: str

    summary: str | None = None

    citation_text: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )
