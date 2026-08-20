import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReferenceCreate(BaseModel):
    """
    Schema de entrada para crear una referencia.
    """

    authors: Optional[str] = Field(
        default=None,
        description="Autores de la referencia",
        max_length=255,
    )

    title: Optional[str] = Field(
        default=None,
        description="Título de la referencia",
        max_length=255,
    )

    year: Optional[int] = Field(
        default=None,
        description="Año de publicación",
        ge=1000,
        le=9999,
    )

    source: Optional[str] = Field(
        default=None,
        description="Fuente de la referencia",
        max_length=255,
    )

    citation_url: Optional[str] = Field(
        default=None,
        description="URL de citación",
        max_length=500,
    )

    display_order: Optional[int] = Field(  # ← AGREGAR
        default=None,
        description="Orden de presentación",
        ge=0,
    )


class ReferenceUpdate(BaseModel):
    """
    Schema de entrada para actualizar una referencia parcialmente.
    """

    authors: Optional[str] = Field(
        default=None,
        description="Autores de la referencia",
        max_length=255,
    )

    title: Optional[str] = Field(
        default=None,
        description="Título de la referencia",
        max_length=255,
    )

    year: Optional[int] = Field(
        default=None,
        description="Año de publicación",
        ge=1000,
        le=9999,
    )

    source: Optional[str] = Field(
        default=None,
        description="Fuente de la referencia",
        max_length=255,
    )

    citation_url: Optional[str] = Field(
        default=None,
        description="URL de citación",
        max_length=500,
    )

    display_order: Optional[int] = Field(
        default=None,
        description="Orden de presentación",
        ge=0,
    )


class ReferenceRead(BaseModel):
    """
    Schema de salida para una referencia (único, sin distinción público/admin).
    """

    id: uuid.UUID
    report_version_id: uuid.UUID
    authors: Optional[str] = None
    title: Optional[str] = None
    year: Optional[int] = None
    source: Optional[str] = None
    citation_url: Optional[str] = None
    display_order: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
