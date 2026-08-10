import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ConceptCreate(BaseModel):
    """
    Schema de entrada para crear un concepto.
    """

    name: str = Field(
        ...,
        description="Nombre del concepto",
        min_length=1,
        max_length=150,
    )

    description: Optional[str] = Field(
        default=None,
        description="Descripción del concepto",
    )

    display_order: Optional[int] = Field(
        default=None,
        description="Orden de presentación del concepto",
    )


class ConceptUpdate(BaseModel):
    """
    Schema de entrada para actualizar un concepto parcialmente.
    """

    name: Optional[str] = Field(
        default=None,
        description="Nombre del concepto",
        min_length=1,
        max_length=150,
    )

    description: Optional[str] = Field(
        default=None,
        description="Descripción del concepto",
    )

    display_order: Optional[int] = Field(
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
    description: Optional[str] = None
    display_order: Optional[int] = None
    created_at: datetime
    updated_at: datetime

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
    description: Optional[str] = None
    display_order: Optional[int] = None

    model_config = ConfigDict(
        from_attributes=True,
    )
