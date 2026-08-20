import uuid
from datetime import datetime
from typing import TYPE_CHECKING  # ← AGREGAR

from pydantic import BaseModel, ConfigDict, Field

if TYPE_CHECKING:  # ← MOVER LA IMPORTACIÓN DENTRO
    from app.modules.report_versions.schema import ReportVersionRead


class ReportCreate(BaseModel):
    """
    Schema de entrada para crear un reporte.
    El slug se genera automáticamente, el usuario no ingresa nada.
    """

    pass  # No necesita campos, el slug es automático


class ReportUpdate(BaseModel):
    """
    Schema de entrada para actualizar un reporte.
    El slug NO se puede actualizar (es inmutable).
    """

    pass  # No se puede actualizar nada en Report


class ReportRead(BaseModel):
    """
    Schema de salida completo para un reporte (contexto administrativo).
    """

    id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReportPublicRead(BaseModel):
    """
    Schema de salida público para un reporte (sin timestamps internos).
    """

    id: uuid.UUID
    slug: str

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReportWithVersionsRead(ReportRead):
    """
    Schema de salida para un reporte con todas sus versiones.
    """

    report_versions: list["ReportVersionRead"] = Field(
        default_factory=list,
        description="Versiones del reporte",
    )

    model_config = ConfigDict(
        from_attributes=True,
    )
