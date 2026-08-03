import uuid
import logging
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
from app.modules.uploads.service import UploadService
from app.shared.enums.resource_type import ResourceType

logger = logging.getLogger(__name__)
class ResourceService:
    """
    Servicio de lógica de negocio para resources.

    Administra metadata del recurso y delega la eliminación
    de archivos en Cloudinary a UploadService.
    """

    def __init__(
        self,
        repository: ResourceRepository,
        section_repository: SectionRepository,
        upload_service: UploadService,
    ) -> None:
        self.repository = repository
        self.section_repository = section_repository
        self.upload_service = upload_service


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
        - Si cloudinary_public_id cambia, se elimina el archivo anterior.
        """

        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        if (
            "cloudinary_public_id" in update_data
            and update_data["cloudinary_public_id"] != resource.cloudinary_public_id
            and resource.cloudinary_public_id is not None
        ):
            self._try_delete_from_cloudinary(
                resource.cloudinary_public_id,
                resource.type,
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

        Si existe cloudinary_public_id, intenta eliminar el archivo
        de Cloudinary antes de borrar el registro.
        """

        resource = self.repository.get_by_id(resource_id)

        if not resource:
            raise NotFoundException(
                message="Recurso no encontrado.",
            )

        if resource.cloudinary_public_id:
            self._try_delete_from_cloudinary(
                resource.cloudinary_public_id,
                resource.type,
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


    def _try_delete_from_cloudinary(
        self,
        public_id: str,
        resource_type: ResourceType,
    ) -> None:
        """
        Intenta eliminar un archivo de Cloudinary.

        Si la eliminación falla, no impide la operación en curso.
        """

        cloudinary_resource_type = self._get_cloudinary_resource_type(
            resource_type,
        )

        try:
            self.upload_service.delete(
                public_id=public_id,
                resource_type=cloudinary_resource_type,
            )
        except Exception:
            logger.exception(
                "Error deleting Cloudinary resource '%s'.",
                public_id,
            )


    @staticmethod
    def _get_cloudinary_resource_type(
        resource_type: ResourceType,
    ) -> str:
        """
        Traduce el ResourceType del dominio al resource_type
        esperado por Cloudinary.

        - IMAGE, GRAPH, DIAGRAM → "image"
        - FILE → "raw"
        """

        if resource_type == ResourceType.FILE:
            return "raw"

        return "image"
