from typing import List
from app.modules.search.schema import SearchResult, SearchResponse
from app.modules.search.repository import SearchRepository


class SearchService:
    """
    Servicio de búsqueda global.
    """

    def __init__(self, repository: SearchRepository):
        self.repository = repository

    def search(self, query: str, limit: int = 20) -> SearchResponse:
        """
        Ejecuta la búsqueda en todas las entidades.
        """
        results: List[SearchResult] = []

        # Buscar en ReportVersion
        for rv in self.repository.search_report_versions(query, limit):
            results.append(
                self._build_result(
                    type="report_version",
                    entity=rv,
                    title=rv.title,
                    matched_field=self._get_matched_field(rv, query),
                    excerpt=self._get_excerpt(rv, query),
                    location={"report_version": rv.id},
                    url=f"/reports/{rv.report_id}/versions/{rv.version}/{rv.language}",
                )
            )

        # Buscar en Section
        for sec in self.repository.search_sections(query, limit):
            results.append(
                self._build_result(
                    type="section",
                    entity=sec,
                    title=sec.title,
                    matched_field=self._get_matched_field(sec, query),
                    excerpt=self._get_excerpt(sec, query),
                    location={
                        "report_version": sec.report_version_id,
                        "section": sec.id,
                    },
                    url=f"/sections/{sec.id}",
                )
            )

        # Buscar en Category
        for cat in self.repository.search_categories(query, limit):
            results.append(
                self._build_result(
                    type="category",
                    entity=cat,
                    title=cat.name,
                    matched_field=self._get_matched_field(cat, query),
                    excerpt=self._get_excerpt(cat, query),
                    location={
                        "report_version": cat.report_version_id,
                        "category": cat.id,
                    },
                    url=f"/categories/{cat.id}",
                )
            )

        # Buscar en Concept
        for con in self.repository.search_concepts(query, limit):
            results.append(
                self._build_result(
                    type="concept",
                    entity=con,
                    title=con.name,
                    matched_field=self._get_matched_field(con, query),
                    excerpt=self._get_excerpt(con, query),
                    location={"category": con.category_id, "concept": con.id},
                    url=f"/concepts/{con.id}",
                )
            )

        # Buscar en Resource
        for res in self.repository.search_resources(query, limit):
            results.append(
                self._build_result(
                    type="resource",
                    entity=res,
                    title=res.title or "Recurso sin título",
                    matched_field=self._get_matched_field(res, query),
                    excerpt=self._get_excerpt(res, query),
                    location={"section": res.section_id, "resource": res.id},
                    url=f"/resources/{res.id}",
                )
            )

        # Buscar en Reference
        for ref in self.repository.search_references(query, limit):
            results.append(
                self._build_result(
                    type="reference",
                    entity=ref,
                    title=ref.title or "Referencia sin título",
                    matched_field=self._get_matched_field(ref, query),
                    excerpt=self._get_excerpt(ref, query),
                    location={
                        "report_version": ref.report_version_id,
                        "reference": ref.id,
                    },
                    url=f"/references/{ref.id}",
                )
            )

        # Ordenar y limitar
        results = results[:limit]

        return SearchResponse(query=query, total=len(results), results=results)

    def _build_result(
        self,
        type: str,
        entity,
        title: str,
        matched_field: str,
        excerpt: str,
        location: dict,
        url: str,
    ) -> SearchResult:
        """Construye un objeto SearchResult."""
        return SearchResult(
            type=type,
            id=str(entity.id),
            title=title,
            matched_field=matched_field,
            excerpt=excerpt,
            location=location,
            url=url,
        )

    def _get_matched_field(self, entity, query: str) -> str:
        """Determina en qué campo se encontró la coincidencia."""
        # Esta es una implementación simplificada, idealmente deberías detectar el campo exacto
        for field in [
            "title",
            "name",
            "content",
            "description",
            "summary",
            "citation_text",
            "authors",
            "source",
        ]:
            if (
                hasattr(entity, field)
                and getattr(entity, field)
                and query.lower() in str(getattr(entity, field)).lower()
            ):
                return field
        return "unknown"

    def _get_excerpt(self, entity, query: str) -> str:
        """Extrae un fragmento del texto alrededor de la coincidencia."""
        # Implementación simple, mejorable
        for field in ["content", "description", "summary", "citation_text"]:
            if hasattr(entity, field) and getattr(entity, field):
                text = str(getattr(entity, field))
                if query.lower() in text.lower():
                    idx = text.lower().find(query.lower())
                    start = max(0, idx - 30)
                    end = min(len(text), idx + 30)
                    return f"...{text[start:end]}..."
        return ""
