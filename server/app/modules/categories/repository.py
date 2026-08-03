import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.categories.model import Category


class CategoryRepository:
    """
    Repositorio de acceso a datos para categorías.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, category_id: uuid.UUID) -> Category | None:
        """
        Obtiene una categoría por ID.
        """

        stmt = (
            select(Category)
            .where(Category.id == category_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_all_by_report(
        self,
        report_id: uuid.UUID,
    ) -> list[Category]:
        """
        Obtiene todas las categorías de un reporte, ordenadas por display_order.
        """

        stmt = (
            select(Category)
            .where(Category.report_id == report_id)
            .order_by(Category.display_order)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_published_by_report(
        self,
        report_id: uuid.UUID,
    ) -> list[Category]:
        """
        Obtiene las categorías publicadas de un reporte, ordenadas por display_order.
        """

        stmt = (
            select(Category)
            .where(
                Category.report_id == report_id,
                Category.published == True,
            )
            .order_by(Category.display_order)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_max_display_order(
        self,
        report_id: uuid.UUID,
    ) -> int:
        """
        Obtiene el máximo display_order de las categorías de un reporte.
        Retorna 0 si no hay categorías.
        """

        stmt = (
            select(func.coalesce(func.max(Category.display_order), 0))
            .where(Category.report_id == report_id)
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
