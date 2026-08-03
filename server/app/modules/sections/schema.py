import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SectionCreate(BaseModel):
    """
    Schema de entrada para crear una sección.
    """

    report_id: uuid.UUID = Field(
        ...,
        description="ID del reporte al que pertenece la sección",
    )

    title: str = Field(
        ...,
        description="Título de la sección",
        min_length=1,
        max_length=255,
    )

    content: str = Field(
        ...,
        description="Contenido de la sección",
        min_length=1,
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación de la sección",
    )

    published: bool = Field(
        default=False,
        description="Estado de publicación de la sección",
    )


class SectionUpdate(BaseModel):
    """
    Schema de entrada para actualizar una sección parcialmente.
    """

    title: str | None = Field(
        default=None,
        description="Título de la sección",
        min_length=1,
        max_length=255,
    )

    content: str | None = Field(
        default=None,
        description="Contenido de la sección",
        min_length=1,
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación de la sección",
    )

    published: bool | None = Field(
        default=None,
        description="Estado de publicación de la sección",
    )


class SectionRead(BaseModel):
    """
    Schema de salida completo para una sección (contexto administrativo).
    """

    id: uuid.UUID

    report_id: uuid.UUID

    title: str

    slug: str

    content: str | None = None

    display_order: int | None = None

    published: bool

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class SectionPublicRead(BaseModel):
    """
    Schema de salida público para una sección (sin timestamps ni published).
    """

    id: uuid.UUID

    report_id: uuid.UUID

    title: str

    slug: str

    content: str | None = None

    display_order: int | None = None

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

    report_id: uuid.UUID

    title: str

    slug: str

    content: str | None = None

    display_order: int | None = None

    previous_section: SectionSummary | None = None

    next_section: SectionSummary | None = None
