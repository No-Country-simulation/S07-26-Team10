import uuid

from app.exceptions import NotFoundException
from app.modules.categories.model import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schema import (
    CategoryCreate,
    CategoryPublicRead,
    CategoryRead,
    CategoryUpdate,
)
from app.modules.reports.repository import ReportRepository


class CategoryService:
    """
    Servicio de lógica de negocio para categorías.
    """

    def __init__(
        self,
        repository: CategoryRepository,
        report_repository: ReportRepository,
    ) -> None:
        self.repository = repository
        self.report_repository = report_repository


    def get_category(
        self,
        category_id: uuid.UUID,
    ) -> CategoryRead:
        """
        Obtiene una categoría por su ID.
        """

        category = self.repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        return CategoryRead.model_validate(category)


    def get_public_categories(
        self,
        report_id: uuid.UUID,
    ) -> list[CategoryPublicRead]:
        """
        Obtiene las categorías publicadas de un reporte.
        """

        self._validate_report_exists(report_id)

        categories = self.repository.get_published_by_report(
            report_id,
        )

        return [
            CategoryPublicRead.model_validate(category)
            for category in categories
        ]


    def get_all_categories(
        self,
        report_id: uuid.UUID,
    ) -> list[CategoryRead]:
        """
        Obtiene todas las categorías de un reporte (admin).
        """

        self._validate_report_exists(report_id)

        categories = self.repository.get_all_by_report(
            report_id,
        )

        return [
            CategoryRead.model_validate(category)
            for category in categories
        ]


    def create_category(
        self,
        data: CategoryCreate,
    ) -> CategoryRead:
        """
        Crea una nueva categoría.

        Reglas:
        - El reporte debe existir.
        - Si no se provee display_order, se asigna el siguiente disponible.
        """

        self._validate_report_exists(data.report_id)

        display_order = data.display_order

        if display_order is None:
            max_order = self.repository.get_max_display_order(
                data.report_id,
            )
            display_order = max_order + 1

        category = Category(
            report_id=data.report_id,
            name=data.name,
            description=data.description,
            display_order=display_order,
            published=data.published,
        )

        created_category = self.repository.create(category)

        return CategoryRead.model_validate(created_category)


    def update_category(
        self,
        category_id: uuid.UUID,
        data: CategoryUpdate,
    ) -> CategoryRead:
        """
        Actualiza parcialmente una categoría.

        Reglas:
        - La categoría debe existir.
        """

        category = self.repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(category, field, value)

        updated_category = self.repository.update(category)

        return CategoryRead.model_validate(updated_category)


    def delete_category(
        self,
        category_id: uuid.UUID,
    ) -> None:
        """
        Elimina una categoría.

        La eliminación en cascada de conceptos hijos es manejada
        por SQLAlchemy (cascade="all, delete-orphan").
        """

        category = self.repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        self.repository.delete(category)


    def _validate_report_exists(
        self,
        report_id: uuid.UUID,
    ) -> None:
        """
        Verifica que el reporte exista.
        """

        report = self.report_repository.get_by_id(report_id)

        if not report:
            raise NotFoundException(
                message="Reporte no encontrado.",
            )
