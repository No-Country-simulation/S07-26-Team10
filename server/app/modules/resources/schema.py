import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.shared.enums.resource_type import ResourceType


class ResourceCreate(BaseModel):
    """
    Schema de entrada para crear un resource.
    """

    type: ResourceType = Field(
        ...,
        description="Tipo de recurso (IMAGE, GRAPH, DIAGRAM, FILE)",
    )

    title: Optional[str] = Field(
        default=None,
        description="Título del recurso",
        max_length=255,
    )

    description: Optional[str] = Field(
        default=None,
        description="Descripción del recurso",
    )

    alt_text: Optional[str] = Field(
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

    type: Optional[ResourceType] = Field(
        default=None,
        description="Tipo de recurso (IMAGE, GRAPH, DIAGRAM, FILE)",
    )

    title: Optional[str] = Field(
        default=None,
        description="Título del recurso",
        max_length=255,
    )

    description: Optional[str] = Field(
        default=None,
        description="Descripción del recurso",
    )

    alt_text: Optional[str] = Field(
        default=None,
        description="Texto alternativo del recurso",
        max_length=255,
    )

    downloadable: Optional[bool] = Field(
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
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: str
    cloudinary_public_id: Optional[str] = None
    alt_text: Optional[str] = None
    downloadable: bool
    created_at: datetime
    updated_at: datetime

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
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: str
    alt_text: Optional[str] = None
    downloadable: bool

    model_config = ConfigDict(
        from_attributes=True,
    )
