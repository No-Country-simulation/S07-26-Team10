import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.resources.model import Resource


class ResourceRepository:
    """
    Repositorio de acceso a datos para resources.
    """

    def __init__(self, db: Session) -> None:
        self.db = db


    def get_by_id(self, resource_id: uuid.UUID) -> Resource | None:
        """
        Obtiene un resource por ID.
        """

        stmt = (
            select(Resource)
            .where(Resource.id == resource_id)
        )

        return self.db.execute(stmt).scalars().first()


    def get_all_by_section(
        self,
        section_id: uuid.UUID,
    ) -> list[Resource]:
        """
        Obtiene todos los resources de una sección, ordenados por created_at.
        """

        stmt = (
            select(Resource)
            .where(Resource.section_id == section_id)
            .order_by(Resource.created_at)
        )

        return list(self.db.execute(stmt).scalars().all())


    def get_downloadable_by_id(
        self,
        resource_id: uuid.UUID,
    ) -> Resource | None:
        """
        Obtiene un resource solo si es descargable.
        """

        stmt = (
            select(Resource)
            .where(
                Resource.id == resource_id,
                Resource.downloadable == True,
            )
        )

        return self.db.execute(stmt).scalars().first()


    def create(self, resource: Resource) -> Resource:
        """
        Crea un resource.
        """

        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)

        return resource


    def update(self, resource: Resource) -> Resource:
        """
        Actualiza un resource.
        """

        self.db.commit()
        self.db.refresh(resource)

        return resource


    def delete(self, resource: Resource) -> None:
        """
        Elimina un resource.
        """

        self.db.delete(resource)
        self.db.commit()
