from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_
from app.modules.report_versions.model import ReportVersion
from app.modules.sections.model import Section
from app.modules.categories.model import Category
from app.modules.concepts.model import Concept
from app.modules.resources.model import Resource
from app.modules.references.model import Reference
from app.shared.enums.publication_status import PublicationStatus


class SearchRepository:
    """
    Repositorio para búsqueda global.
    """

    def __init__(self, db: Session):
        self.db = db

    def search_report_versions(self, query: str, limit: int) -> list[ReportVersion]:
        """Busca en ReportVersion (solo PUBLISHED)."""
        stmt = (
            select(ReportVersion)
            .where(
                and_(
                    ReportVersion.status == PublicationStatus.PUBLISHED,
                    or_(
                        ReportVersion.title.ilike(f"%{query}%"),
                        ReportVersion.summary.ilike(f"%{query}%"),
                        ReportVersion.citation_text.ilike(f"%{query}%"),
                    ),
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def search_sections(self, query: str, limit: int) -> list[Section]:
        """Busca en Section (solo PUBLISHED)."""
        stmt = (
            select(Section)
            .where(
                and_(
                    Section.status == PublicationStatus.PUBLISHED,
                    or_(
                        Section.title.ilike(f"%{query}%"),
                        Section.content.ilike(f"%{query}%"),
                    ),
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def search_categories(self, query: str, limit: int) -> list[Category]:
        """Busca en Category (solo PUBLISHED)."""
        stmt = (
            select(Category)
            .where(
                and_(
                    Category.status == PublicationStatus.PUBLISHED,
                    or_(
                        Category.name.ilike(f"%{query}%"),
                        Category.description.ilike(f"%{query}%"),
                    ),
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def search_concepts(self, query: str, limit: int) -> list[Concept]:
        """Busca en Concept (hereda status de Category)."""
        stmt = (
            select(Concept)
            .join(Category)
            .where(
                and_(
                    Category.status == PublicationStatus.PUBLISHED,
                    or_(
                        Concept.name.ilike(f"%{query}%"),
                        Concept.description.ilike(f"%{query}%"),
                    ),
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def search_resources(self, query: str, limit: int) -> list[Resource]:
        """Busca en Resource (hereda status de Section)."""
        stmt = (
            select(Resource)
            .join(Section)
            .where(
                and_(
                    Section.status == PublicationStatus.PUBLISHED,
                    or_(
                        Resource.title.ilike(f"%{query}%"),
                        Resource.description.ilike(f"%{query}%"),
                        Resource.alt_text.ilike(f"%{query}%"),
                    ),
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())

    def search_references(self, query: str, limit: int) -> list[Reference]:
        """Busca en Reference (hereda status de ReportVersion)."""
        stmt = (
            select(Reference)
            .join(ReportVersion)
            .where(
                and_(
                    ReportVersion.status == PublicationStatus.PUBLISHED,
                    or_(
                        Reference.authors.ilike(f"%{query}%"),
                        Reference.title.ilike(f"%{query}%"),
                        Reference.source.ilike(f"%{query}%"),
                    ),
                )
            )
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
