import uuid
from typing import Optional

from app.exceptions import ConflictException, NotFoundException
from app.modules.categories.model import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schema import (
    CategoryCreate,
    CategoryPublicRead,
    CategoryRead,
    CategoryUpdate,
    CategoryWithConceptsRead,
)
from app.modules.report_versions.repository import ReportVersionRepository
from app.shared.enums.publication_status import PublicationStatus
from app.shared.utils.validators import (
    validate_report_version_exists,
    validate_report_version_published,
)


class CategoryService:
    """
    Servicio de lógica de negocio para categorías.
    SOLO maneja operaciones relacionadas con Category.
    """

    def __init__(
        self,
        repository: CategoryRepository,
        report_version_repository: ReportVersionRepository,
    ) -> None:
        self.repository = repository
        self.report_version_repository = report_version_repository

    def get_category(self, report_version_id, category_id: uuid.UUID) -> CategoryRead:
        """
        Obtiene una categoría por su ID.
        """
        category = self.repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        validate_report_version_published(
            report_version_id, self.report_version_repository
        )

        return CategoryRead.model_validate(category)

    def get_categories_by_report_version(
        self,
        report_version_id: uuid.UUID,
        status: Optional[PublicationStatus] = None,
    ) -> list[CategoryRead]:
        """
        Obtiene todas las categorías de una versión de reporte.

        Args:
            report_version_id: ID de la versión del reporte
            status: Filtrar por estado de publicación (opcional)
        """
        # Validar que la versión del reporte existe
        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        categories = self.repository.get_by_report_version_id(report_version_id, status)

        return [CategoryRead.model_validate(category) for category in categories]

    def get_published_categories(
        self,
        report_version_id: uuid.UUID,
    ) -> list[CategoryPublicRead]:
        """
        Obtiene las categorías publicadas de una versión de reporte.

        Args:
            report_version_id: ID de la versión del reporte
        """
        # Validar que la versión del reporte existe
        validate_report_version_published(
            report_version_id, self.report_version_repository
        )

        categories = self.repository.get_published_by_report_version(report_version_id)

        return [CategoryPublicRead.model_validate(category) for category in categories]

    def create_category(
        self,
        report_version_id: uuid.UUID,
        data: CategoryCreate,
    ) -> CategoryRead:
        """
        Crea una nueva categoría.

        Reglas:
        - La versión de reporte debe existir.
        - El nombre debe ser único dentro de la versión de reporte.
        - Si no se especifica display_order, se asigna el siguiente.
        - El status por defecto es DRAFT.
        """
        # Validar que la versión del reporte existe
        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        # Validar que el nombre sea único
        if self.repository.exists_by_name(report_version_id, data.name):
            raise ConflictException(
                message=f"Ya existe una categoría con el nombre '{data.name}' en esta versión.",
            )

        display_order = data.display_order
        if display_order is None:
            max_order = self.repository.get_max_display_order(report_version_id)
            display_order = max_order + 1

        # Validar que el display_order sea único

        if display_order is not None:
            if self.repository.exists_by_display_order(
                report_version_id, display_order
            ):
                raise ConflictException(
                    message=f"Ya existe una categoría con el orden '{display_order}' en esta versión."
                )

        # Determinar display_order
        display_order = data.display_order
        if display_order is None:
            max_order = self.repository.get_max_display_order(report_version_id)
            display_order = max_order + 1

        category = Category(
            report_version_id=report_version_id,
            name=data.name,
            description=data.description,
            display_order=display_order,
            status=data.status if data.status else PublicationStatus.DRAFT,
        )

        created_category = self.repository.create(category)

        return CategoryRead.model_validate(created_category)

    def update_category(
        self,
        report_version_id: uuid.UUID,
        category_id: uuid.UUID,
        data: CategoryUpdate,
    ) -> CategoryRead:
        """
        Actualiza parcialmente una categoría.

        Reglas:
        - La categoría debe existir.
        - Si se cambia el nombre, debe ser único dentro de la versión.
        """
        category = self.repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        # Si se actualiza el nombre, validar unicidad
        if "name" in update_data:
            if self.repository.exists_by_name(
                category.report_version_id,
                update_data["name"],
                exclude_id=category_id,
            ):
                raise ConflictException(
                    message=f"Ya existe una categoría con el nombre '{update_data['name']}' en esta versión.",
                )

        # Si se actualiza display_order, validar unicidad
        if "display_order" in update_data:
            if self.repository.exists_by_display_order(
                category.report_version_id,
                update_data["display_order"],
                exclude_id=category_id,
            ):
                raise ConflictException(
                    message=f"Ya existe una categoría con el orden '{update_data['display_order']}' en esta versión."
                )

        for field, value in update_data.items():
            setattr(category, field, value)

        updated_category = self.repository.update(category)

        return CategoryRead.model_validate(updated_category)

    def delete_category(
        self, report_version_id: uuid.UUID, category_id: uuid.UUID
    ) -> None:
        """
        Elimina una categoría.

        Args:
            category_id: ID de la categoría a eliminar
        """
        category = self.repository.get_by_id(category_id)

        if not category:
            raise NotFoundException(
                message="Categoría no encontrada.",
            )

        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        self.repository.delete(category)

    def get_all_categories_with_concepts(
        self,
        report_version_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[CategoryWithConceptsRead]:
        """
        Obtiene todas las categorías de una versión de reporte con sus conceptos cargados (admin).
        No filtra por status - ve DRAFT y PUBLISHED.
        """
        validate_report_version_exists(
            report_version_id, self.report_version_repository
        )

        categories = self.repository.get_all_with_concepts(
            report_version_id, skip, limit
        )

        return [
            CategoryWithConceptsRead.model_validate(category) for category in categories
        ]
