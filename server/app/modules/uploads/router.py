from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile

from app.core.constants import HTTP_201_CREATED
from app.core.dependencies import get_current_user

from app.modules.uploads.schema import (
    UploadResourceType,
    UploadResponse,
)
from app.modules.uploads.service import UploadService
from app.modules.users.model import User

from app.shared.services.cloudinary import CloudinaryService


router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
)


def get_upload_service() -> UploadService:
    """
    Factory para inyectar UploadService.
    """

    cloudinary_service = CloudinaryService()

    return UploadService(
        cloudinary_service=cloudinary_service,
    )


@router.post(
    "/",
    response_model=UploadResponse,
    status_code=HTTP_201_CREATED,
    summary="Subir archivo",
    description="Sube una imagen o archivo a Cloudinary y devuelve su metadata.",
    responses={
        201: {
            "description": "Archivo subido correctamente",
        },
        401: {
            "description": "Token inválido o expirado",
        },
    },
)
async def upload_file(
    file: UploadFile = File(...),
    resource_type: UploadResourceType = UploadResourceType.IMAGE,
    current_user: User = Depends(get_current_user),
    service: UploadService = Depends(get_upload_service),
) -> UploadResponse:
    """
    Sube un archivo a Cloudinary.
    """

    return await service.upload(
        file=file,
        resource_type=resource_type,
    )