import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from app.modules.resources.schema import ResourceRead  # ← AGREGAR
from app.shared.enums.publication_status import PublicationStatus


class SectionCreate(BaseModel):
    """
    Schema de entrada para crear una sección.
    """

    title: str = Field(
        ...,
        description="Título de la sección",
        min_length=1,
        max_length=255,
    )

    content: Optional[str] = Field(
        default=None,
        description="Contenido de la sección",
    )

    display_order: Optional[int] = Field(
        default=None,
        description="Orden de presentación de la sección",
    )

    status: Optional[PublicationStatus] = Field(  # ← AGREGAR
        default=PublicationStatus.DRAFT,
        description="Estado de publicación de la sección (DRAFT, PUBLISHED)",
    )


class SectionUpdate(BaseModel):
    """
    Schema de entrada para actualizar una sección parcialmente.
    """

    title: Optional[str] = Field(
        default=None,
        description="Título de la sección",
        min_length=1,
        max_length=255,
    )

    content: Optional[str] = Field(
        default=None,
        description="Contenido de la sección",
    )

    display_order: Optional[int] = Field(
        default=None,
        description="Orden de presentación de la sección",
    )

    status: Optional[PublicationStatus] = Field(
        default=None,
        description="Estado de publicación de la sección (DRAFT, PUBLISHED)",
    )


class SectionRead(BaseModel):
    """
    Schema de salida completo para una sección (contexto administrativo).
    """

    id: uuid.UUID
    report_version_id: uuid.UUID
    title: str
    slug: str
    content: Optional[str] = None
    display_order: Optional[int] = None
    status: PublicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class SectionPublicRead(BaseModel):
    """
    Schema de salida público para una sección (sin timestamps ni status).
    """

    id: uuid.UUID
    report_version_id: uuid.UUID
    title: str
    slug: str
    content: Optional[str] = None
    display_order: Optional[int] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class SectionSummary(BaseModel):
    """
    Schema auxiliar para representar una sección resumida en la navegación.
    """

    id: uuid.UUID
    title: str
    slug: str

    model_config = ConfigDict(
        from_attributes=True,
    )


class SectionNavigationRead(BaseModel):
    """
    Schema de salida para una sección con navegación anterior/siguiente.
    """

    id: uuid.UUID
    report_version_id: uuid.UUID
    title: str
    slug: str
    content: Optional[str] = None
    display_order: Optional[int] = None
    previous_section: Optional[SectionSummary] = None
    next_section: Optional[SectionSummary] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class SectionWithResourcesRead(SectionRead):
    """
    Schema de salida para una sección con todos sus recursos.
    """

    resources: list[ResourceRead] = Field(
        default_factory=list,
        description="Recursos asociados a la sección",
    )
