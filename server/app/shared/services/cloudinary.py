import cloudinary
import cloudinary.uploader

from app.core.config import settings


class CloudinaryService:
    """
    Servicio encargado de gestionar archivos en Cloudinary.

    Este servicio no conoce Resources ni Sections.
    Su única responsabilidad es subir y eliminar archivos.
    """

    def __init__(self) -> None:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )

    def upload_image(
        self,
        file,
        folder: str = "physaflow/images",
    ) -> dict:
        """
        Sube una imagen a Cloudinary.

        Retorna metadata del archivo subido.
        """

        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
        )

        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "width": result.get("width"),
            "height": result.get("height"),
            "resource_type": result.get("resource_type"),
        }

    def upload_file(
        self,
        file,
        folder: str = "physaflow/files",
    ) -> dict:
        """
        Sube archivos generales:
        PDF, documentos, etc.
        """

        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="raw",
        )

        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "resource_type": result.get("resource_type"),
        }

    def delete(
        self,
        public_id: str,
        resource_type: str = "image",
    ) -> dict:
        """
        Elimina un archivo de Cloudinary.

        resource_type:
        - image
        - raw
        - video
        """

        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
        )

        return result