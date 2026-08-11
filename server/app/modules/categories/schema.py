import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.shared.enums.publication_status import PublicationStatus
from app.modules.concepts.schema import ConceptRead  # Para relaciones


class CategoryCreate(BaseModel):
    """
    Schema de entrada para crear una categoría.
    """

    name: str = Field(
        ...,
        description="Nombre de la categoría",
        min_length=1,
        max_length=150,
    )

    description: Optional[str] = Field(
        default=None,
        description="Descripción de la categoría",
    )

    display_order: Optional[int] = Field(
        default=None,
        description="Orden de presentación de la categoría",
    )


class CategoryUpdate(BaseModel):
    """
    Schema de entrada para actualizar una categoría parcialmente.
    """

    name: Optional[str] = Field(
        default=None,
        description="Nombre de la categoría",
        min_length=1,
        max_length=150,
    )

    description: Optional[str] = Field(
        default=None,
        description="Descripción de la categoría",
    )

    display_order: Optional[int] = Field(
        default=None,
        description="Orden de presentación de la categoría",
    )

    status: Optional[PublicationStatus] = Field(
        default=None,
        description="Estado de publicación de la categoría (DRAFT, PUBLISHED)",
    )


class CategoryRead(BaseModel):
    """
    Schema de salida completo para una categoría (contexto administrativo).
    """

    id: uuid.UUID
    report_version_id: uuid.UUID
    name: str
    description: Optional[str] = None
    display_order: Optional[int] = None
    status: PublicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class CategoryDetailRead(CategoryRead):
    """
    Schema de salida con detalles completos (incluye conceptos).
    """

    concepts: list["ConceptRead"] = Field(
        default_factory=list,
        description="Conceptos de esta categoría",
    )


class CategoryPublicRead(BaseModel):
    """
    Schema de salida público para una categoría (sin timestamps ni status).
    """

    id: uuid.UUID
    report_version_id: uuid.UUID
    name: str
    description: Optional[str] = None
    display_order: Optional[int] = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class CategoryWithConceptsRead(CategoryRead):
    """
    Schema de salida para una categoría con todos sus conceptos.
    """

    concepts: list[ConceptRead] = Field(
        default_factory=list,
        description="Conceptos asociados a la categoría",
    )


# Para resolver referencias circulares (cuando exista ConceptRead)
# CategoryDetailRead.model_rebuild()
