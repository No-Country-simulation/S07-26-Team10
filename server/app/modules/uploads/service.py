from fastapi import UploadFile

from app.shared.services.cloudinary import CloudinaryService
from app.modules.uploads.schema import UploadResourceType, UploadResponse


class UploadService:
    """
    Servicio encargado de gestionar uploads.

    No conoce Resources.
    Solo maneja archivos y Cloudinary.
    """

    def __init__(
        self,
        cloudinary_service: CloudinaryService,
    ) -> None:
        self.cloudinary_service = cloudinary_service

    async def upload(
        self,
        file: UploadFile,
        resource_type: UploadResourceType,
    ) -> UploadResponse:
        """
        Sube un archivo a Cloudinary.
        """
        contents = await file.read()

        if resource_type == UploadResourceType.IMAGE:
            result = self.cloudinary_service.upload_image(contents)
        else:
            result = self.cloudinary_service.upload_file(contents)

        return UploadResponse(
            url=result["url"],
            public_id=result["public_id"],
            resource_type=UploadResourceType(result["resource_type"]),
            width=result.get("width"),
            height=result.get("height"),
        )

    def delete(
        self,
        public_id: str,
        resource_type: UploadResourceType,
    ) -> dict:
        """
        Elimina un archivo de Cloudinary.
        """
        return self.cloudinary_service.delete(
            public_id=public_id,
            resource_type=resource_type.value,
        )
