import uuid
from typing import Optional

from app.exceptions import ConflictException, NotFoundException
from app.modules.resources.model import Resource
from app.modules.resources.repository import ResourceRepository
from app.modules.resources.schema import (
    ResourceCreate,
    ResourcePublicRead,
    ResourceRead,
    ResourceUpdate,
)
from app.modules.sections.repository import SectionRepository
from app.modules.uploads.schema import UploadResponse


class ResourceService:
    """
    Servicio de lógica de negocio para resources.
    SOLO maneja operaciones relacionadas con Resource en BD.
    NO maneja Cloudinary - eso es responsabilidad de UploadService.
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
        Obtiene un resource por su ID (admin).
        """
        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        return ResourceRead.model_validate(resource)

    def get_public_resource(
        self,
        resource_id: uuid.UUID,
    ) -> ResourcePublicRead:
        """
        Obtiene un resource por su ID (acceso público).
        """
        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        return ResourcePublicRead.model_validate(resource)

    def get_resources_by_section(
        self,
        section_id: uuid.UUID,
    ) -> list[ResourcePublicRead]:
        """
        Obtiene todos los resources de una sección (acceso público).
        """
        self._validate_section_exists(section_id)

        resources = self.repository.get_by_section_id(section_id)

        return [
            ResourcePublicRead.model_validate(resource)
            for resource in resources
        ]

    def get_all_resources(
        self,
        section_id: uuid.UUID,
    ) -> list[ResourceRead]:
        """
        Obtiene todos los resources de una sección (admin).
        """
        self._validate_section_exists(section_id)

        resources = self.repository.get_by_section_id(section_id)

        return [
            ResourceRead.model_validate(resource)
            for resource in resources
        ]

    def get_downloadable_resource(
        self,
        resource_id: uuid.UUID,
    ) -> ResourcePublicRead:
        """
        Obtiene un resource solo si es descargable (acceso público).
        """
        resource = self.repository.get_downloadable_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso descargable no encontrado.",
            )

        return ResourcePublicRead.model_validate(resource)

    def create_resource(
        self,
        section_id: uuid.UUID,
        data: ResourceCreate,
        upload_data: UploadResponse,
    ) -> ResourceRead:
        """
        Crea un nuevo resource.

        Reglas:
        - La sección debe existir.
        - file_url y cloudinary_public_id vienen del servicio de uploads.
        """
        self._validate_section_exists(section_id)

        # Verificar que el public_id no exista ya en la BD
        if self.repository.exists_by_public_id(upload_data.public_id):
            raise ConflictException(
                message=f"El archivo con public_id '{upload_data.public_id}' ya está registrado.",
            )

        resource = Resource(
            section_id=section_id,
            type=data.type,
            title=data.title,
            description=data.description,
            file_url=upload_data.url,
            cloudinary_public_id=upload_data.public_id,
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
        - No se puede actualizar file_url ni cloudinary_public_id desde aquí.
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
    ) -> ResourceRead:
        """
        Elimina un resource de la BD.
        NOTA: El archivo en Cloudinary debe eliminarse por separado desde UploadService.
        """
        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        # Guardar datos antes de eliminar para devolverlos
        resource_data = ResourceRead.model_validate(resource)

        self.repository.delete(resource)

        return resource_data

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