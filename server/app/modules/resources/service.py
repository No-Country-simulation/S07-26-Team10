import uuid

from app.exceptions import NotFoundException
from app.modules.resources.model import Resource
from app.modules.resources.repository import ResourceRepository
from app.modules.resources.schema import (
    ResourceCreate,
    ResourcePublicRead,
    ResourceRead,
    ResourceUpdate,
)
from app.modules.sections.repository import SectionRepository


class ResourceService:
    """
    Servicio de lógica de negocio para resources.

    No importa ni llama a Cloudinary.
    Solo administra metadata del recurso.
    """

    def __init__(
        self,
        repository: ResourceRepository,
        section_repository: SectionRepository,
    ) -> None:
        self.repository = repository
        self.section_repository = section_repository


    def get_resource(
        self,
        resource_id: uuid.UUID,
    ) -> ResourceRead:
        """
        Obtiene un resource por su ID.
        """

        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        return ResourceRead.model_validate(resource)


    def get_public_resources(
        self,
        section_id: uuid.UUID,
    ) -> list[ResourcePublicRead]:
        """
        Obtiene los resources de una sección.
        """

        self._validate_section_exists(section_id)

        resources = self.repository.get_all_by_section(
            section_id,
        )

        return [
            ResourcePublicRead.model_validate(resource)
            for resource in resources
        ]


    def get_downloadable_resource(
        self,
        resource_id: uuid.UUID,
    ) -> ResourcePublicRead:
        """
        Obtiene un resource descargable por ID.
        """

        resource = self.repository.get_downloadable_by_id(
            resource_id,
        )

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado o no disponible para descarga.",
            )

        return ResourcePublicRead.model_validate(resource)


    def get_all_resources(
        self,
        section_id: uuid.UUID,
    ) -> list[ResourceRead]:
        """
        Obtiene todos los resources de una sección (admin).
        """

        self._validate_section_exists(section_id)

        resources = self.repository.get_all_by_section(
            section_id,
        )

        return [
            ResourceRead.model_validate(resource)
            for resource in resources
        ]


    def create_resource(
        self,
        data: ResourceCreate,
    ) -> ResourceRead:
        """
        Crea un nuevo resource.

        Reglas:
        - La sección debe existir.
        """

        self._validate_section_exists(data.section_id)

        resource = Resource(
            section_id=data.section_id,
            type=data.type,
            title=data.title,
            description=data.description,
            file_url=data.file_url,
            cloudinary_public_id=data.cloudinary_public_id,
            alt_text=data.alt_text,
            downloadable=data.downloadable,
        )

        created_resource = self.repository.create(resource)

        return ResourceRead.model_validate(created_resource)


    def update_resource(
        self,
        resource_id: uuid.UUID,
        data: ResourceUpdate,
    ) -> ResourceRead:
        """
        Actualiza parcialmente un resource.

        Reglas:
        - El resource debe existir.
        """

        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(resource, field, value)

        updated_resource = self.repository.update(resource)

        return ResourceRead.model_validate(updated_resource)


    def delete_resource(
        self,
        resource_id: uuid.UUID,
    ) -> None:
        """
        Elimina un resource de la base de datos.

        Nota: la eliminación del archivo en Cloudinary se manejará
        en una futura integración usando cloudinary_public_id.
        """

        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        self.repository.delete(resource)


    def _validate_section_exists(
        self,
        section_id: uuid.UUID,
    ) -> None:
        """
        Verifica que la sección exista.
        """

        section = self.section_repository.get_by_id(section_id)

        if not section:
            raise NotFoundException(
                message="Sección no encontrada.",
            )
