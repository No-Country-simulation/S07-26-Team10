from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """
    Request para búsqueda.
    """

    q: str = Field(..., description="Palabra o frase a buscar", min_length=1)
    limit: int = Field(default=20, ge=1, le=100, description="Máximo de resultados")


class SearchResult(BaseModel):
    """
    Un resultado de búsqueda.
    """

    type: str = Field(
        ...,
        description="Tipo de entidad: report_version, section, category, concept, resource, reference",
    )
    id: str = Field(..., description="ID de la entidad")
    title: str = Field(..., description="Título o nombre de la entidad")
    matched_field: str = Field(
        ..., description="Campo donde se encontró la coincidencia"
    )
    excerpt: Optional[str] = Field(
        None, description="Fragmento del texto con la coincidencia"
    )
    location: Dict[str, Any] = Field(..., description="Ubicación jerárquica")
    url: str = Field(..., description="URL para acceder al contenido")


class SearchResponse(BaseModel):
    """
    Respuesta de búsqueda.
    """

    query: str = Field(..., description="Palabra o frase buscada")
    total: int = Field(..., description="Total de resultados")
    results: List[SearchResult] = Field(default_factory=list, description="Resultados")
