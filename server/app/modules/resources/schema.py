import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.shared.enums.resource_type import ResourceType


class ResourceCreate(BaseModel):
    """
    Schema de entrada para crear un resource.
    """

    section_id: uuid.UUID = Field(
        ...,
        description="ID de la sección a la que pertenece el recurso",
    )

    type: ResourceType = Field(
        ...,
        description="Tipo de recurso (IMAGE, GRAPH, DIAGRAM, FILE)",
    )

    title: str | None = Field(
        default=None,
        description="Título del recurso",
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        description="Descripción del recurso",
    )

    file_url: str = Field(
        ...,
        description="URL del archivo",
        min_length=1,
        max_length=500,
    )

    cloudinary_public_id: str | None = Field(
        default=None,
        description="ID público del archivo en Cloudinary",
        max_length=255,
    )

    alt_text: str | None = Field(
        default=None,
        description="Texto alternativo del recurso",
        max_length=255,
    )

    downloadable: bool = Field(
        default=False,
        description="Indica si el recurso es descargable",
    )


class ResourceUpdate(BaseModel):
    """
    Schema de entrada para actualizar un resource parcialmente.
    """

    type: ResourceType | None = Field(
        default=None,
        description="Tipo de recurso (IMAGE, GRAPH, DIAGRAM, FILE)",
    )

    title: str | None = Field(
        default=None,
        description="Título del recurso",
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        description="Descripción del recurso",
    )

    file_url: str | None = Field(
        default=None,
        description="URL del archivo",
        min_length=1,
        max_length=500,
    )

    cloudinary_public_id: str | None = Field(
        default=None,
        description="ID público del archivo en Cloudinary",
        max_length=255,
    )

    alt_text: str | None = Field(
        default=None,
        description="Texto alternativo del recurso",
        max_length=255,
    )

    downloadable: bool | None = Field(
        default=None,
        description="Indica si el recurso es descargable",
    )


class ResourceRead(BaseModel):
    """
    Schema de salida completo para un resource (contexto administrativo).
    """

    id: uuid.UUID

    section_id: uuid.UUID

    type: ResourceType

    title: str | None = None

    description: str | None = None

    file_url: str

    cloudinary_public_id: str | None = None

    alt_text: str | None = None

    downloadable: bool

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class ResourcePublicRead(BaseModel):
    """
    Schema de salida público para un resource (sin timestamps ni cloudinary_public_id).
    """

    id: uuid.UUID

    section_id: uuid.UUID

    type: ResourceType

    title: str | None = None

    description: str | None = None

    file_url: str

    alt_text: str | None = None

    downloadable: bool

    model_config = ConfigDict(
        from_attributes=True,
    )
