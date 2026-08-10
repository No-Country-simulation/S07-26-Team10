import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.categories.model import Category
from app.shared.enums.publication_status import PublicationStatus


class CategoryRepository:
    """
    Repositorio de acceso a datos para categorías.
    SOLO maneja operaciones CRUD del modelo Category.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, category_id: uuid.UUID) -> Category | None:
        """
        Obtiene una categoría por ID.
        """
        stmt = select(Category).where(Category.id == category_id)
        return self.db.execute(stmt).scalars().first()

    def get_by_report_version_id(
        self,
        report_version_id: uuid.UUID,
        status: PublicationStatus | None = None,
    ) -> list[Category]:
        """
        Obtiene todas las categorías de una versión de reporte.

        Args:
            report_version_id: ID de la versión del reporte
            status: Filtrar por estado de publicación (opcional)
        """
        stmt = select(Category).where(Category.report_version_id == report_version_id)

        if status:
            stmt = stmt.where(Category.status == status)

        stmt = stmt.order_by(Category.display_order)

        return list(self.db.execute(stmt).scalars().all())

    def get_published_by_report_version(
        self,
        report_version_id: uuid.UUID,
    ) -> list[Category]:
        """
        Obtiene las categorías publicadas de una versión de reporte.
        """
        return self.get_by_report_version_id(
            report_version_id,
            status=PublicationStatus.PUBLISHED,
        )

    def get_max_display_order(
        self,
        report_version_id: uuid.UUID,
    ) -> int:
        """
        Obtiene el máximo display_order de las categorías de una versión de reporte.
        Retorna 0 si no hay categorías.
        """
        stmt = select(func.coalesce(func.max(Category.display_order), 0)).where(
            Category.report_version_id == report_version_id
        )

        result = self.db.execute(stmt).scalar()
        return result or 0

    def create(self, category: Category) -> Category:
        """
        Crea una categoría.
        """
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category: Category) -> Category:
        """
        Actualiza una categoría.
        """
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        """
        Elimina una categoría.
        """
        self.db.delete(category)
        self.db.commit()

    def exists_by_name(
        self,
        report_version_id: uuid.UUID,
        name: str,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        """
        Verifica si existe una categoría con el mismo nombre en la misma versión de reporte.
        """
        stmt = select(Category).where(
            Category.report_version_id == report_version_id,
            Category.name == name,
        )

        if exclude_id:
            stmt = stmt.where(Category.id != exclude_id)

        return self.db.execute(stmt).scalars().first() is not None
