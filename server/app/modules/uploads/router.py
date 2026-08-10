from fastapi import APIRouter, Depends, File, UploadFile

from app.core.constants import HTTP_200_OK, HTTP_201_CREATED
from app.core.dependencies import get_current_user
from app.modules.uploads.schema import UploadResourceType, UploadResponse
from app.modules.uploads.service import UploadService
from app.modules.users.model import User
from app.shared.services.cloudinary import CloudinaryService

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"],
)


def get_upload_service() -> UploadService:
    """
    Dependencia para obtener el servicio de uploads.
    """
    cloudinary_service = CloudinaryService()
    return UploadService(cloudinary_service=cloudinary_service)


# ==================== ENDPOINTS PRIVADOS (requieren autenticación) ====================


@router.post(
    "",
    response_model=UploadResponse,
    status_code=HTTP_201_CREATED,
    summary="Subir archivo",
    description="Sube una imagen o archivo a Cloudinary. (Requiere autenticación)",
)
async def upload_file(
    file: UploadFile = File(
        ...,
        description="Archivo a subir (imagen o documento)",
    ),
    resource_type: UploadResourceType = UploadResourceType.IMAGE,
    service: UploadService = Depends(get_upload_service),
    current_user: User = Depends(get_current_user),
) -> UploadResponse:
    """
    Sube un archivo a Cloudinary.

    Tipos soportados:
    - IMAGE: imágenes (jpg, png, gif, etc.)
    - FILE: documentos (pdf, doc, etc.)

    Retorna la URL y metadata del archivo subido.
    Requiere autenticación.
    """
    return await service.upload(
        file=file,
        resource_type=resource_type,
    )


@router.delete(
    "/{public_id}",
    status_code=HTTP_200_OK,
    summary="Eliminar archivo",
    description="Elimina un archivo de Cloudinary. (Requiere autenticación)",
)
async def delete_file(
    public_id: str,
    resource_type: UploadResourceType = UploadResourceType.IMAGE,
    service: UploadService = Depends(get_upload_service),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Elimina un archivo de Cloudinary.

    Args:
        public_id: ID público del archivo en Cloudinary
        resource_type: Tipo de recurso (image o raw)

    Requiere autenticación.
    """
    return service.delete(
        public_id=public_id,
        resource_type=resource_type,
    )
