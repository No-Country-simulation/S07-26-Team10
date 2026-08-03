import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ConceptCreate(BaseModel):
    """
    Schema de entrada para crear un concepto.
    """

    category_id: uuid.UUID = Field(
        ...,
        description="ID de la categoría a la que pertenece el concepto",
    )

    name: str = Field(
        ...,
        description="Nombre del concepto",
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        description="Descripción del concepto",
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación del concepto",
    )


class ConceptUpdate(BaseModel):
    """
    Schema de entrada para actualizar un concepto parcialmente.
    """

    name: str | None = Field(
        default=None,
        description="Nombre del concepto",
        min_length=1,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        description="Descripción del concepto",
    )

    display_order: int | None = Field(
        default=None,
        description="Orden de presentación del concepto",
    )


class ConceptRead(BaseModel):
    """
    Schema de salida completo para un concepto (contexto administrativo).
    """

    id: uuid.UUID

    category_id: uuid.UUID

    name: str

    description: str | None = None

    display_order: int | None = None

    created_at: datetime | None = None

    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class ConceptPublicRead(BaseModel):
    """
    Schema de salida público para un concepto (sin timestamps).
    """

    id: uuid.UUID

    category_id: uuid.UUID

    name: str

    description: str | None = None

    display_order: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )
