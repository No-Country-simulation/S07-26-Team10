from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.modules.search.schema import SearchResponse, SearchRequest
from app.modules.search.service import SearchService
from app.modules.search.repository import SearchRepository

router = APIRouter(prefix="/search", tags=["Search"])


def get_search_service(db: Session = Depends(get_db)) -> SearchService:
    repository = SearchRepository(db)
    return SearchService(repository)


@router.get("/", response_model=SearchResponse)
def search(
    q: str = Query(..., description="Palabra o frase a buscar", min_length=1),
    limit: int = Query(default=20, ge=1, le=100, description="Máximo de resultados"),
    service: SearchService = Depends(get_search_service),
):
    """
    Busca en todo el contenido publicado.
    """
    return service.search(q, limit)
