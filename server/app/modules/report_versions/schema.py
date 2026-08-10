import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.shared.enums.language_code import LanguageCode
from app.shared.enums.publication_status import PublicationStatus
from app.modules.sections.schema import SectionRead
from app.modules.references.schema import ReferenceRead
from app.modules.categories.schema import CategoryRead


class ReportVersionCreate(BaseModel):
    """
    Schema de entrada para crear una versión de reporte.
    """

    title: str = Field(
        ...,
        description="Título de la versión del reporte",
        min_length=1,
        max_length=255,
    )

    version: str = Field(
        ...,
        description="Número de versión (ej: v1, v2)",
        min_length=1,
        max_length=10,
        pattern=r"^v\d+$",  # Formato: v1, v2, v3...
    )

    language: LanguageCode = Field(
        ...,
        description="Código de idioma (ES, EN)",
    )

    summary: Optional[str] = Field(
        default=None,
        description="Resumen de la versión del reporte",
    )

    citation_text: Optional[str] = Field(
        default=None,
        description="Texto de citación",
    )


class ReportVersionUpdate(BaseModel):
    """
    Schema de entrada para actualizar una versión de reporte parcialmente.
    """

    title: Optional[str] = Field(
        default=None,
        description="Título de la versión del reporte",
        min_length=1,
        max_length=255,
    )

    summary: Optional[str] = Field(
        default=None,
        description="Resumen de la versión del reporte",
    )

    citation_text: Optional[str] = Field(
        default=None,
        description="Texto de citación",
    )

    status: Optional[PublicationStatus] = Field(
        default=None,
        description="Estado de publicación (DRAFT, PUBLISHED)",
    )


class ReportVersionRead(BaseModel):
    """
    Schema de salida para una versión de reporte.
    """

    id: uuid.UUID
    report_id: uuid.UUID
    title: str
    version: str
    language: LanguageCode
    summary: Optional[str] = None
    citation_text: Optional[str] = None
    status: PublicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReportVersionDetailRead(ReportVersionRead):
    """
    Schema de salida con detalles completos (incluye relaciones).
    """

    sections: list["SectionRead"] = Field(
        default_factory=list,
        description="Secciones de esta versión",
    )

    references: list["ReferenceRead"] = Field(
        default_factory=list,
        description="Referencias de esta versión",
    )

    categories: list["CategoryRead"] = Field(
        default_factory=list,
        description="Categorías de esta versión",
    )


# Para resolver referencias circulares (cuando existan los schemas)
# ReportVersionDetailRead.model_rebuild()
