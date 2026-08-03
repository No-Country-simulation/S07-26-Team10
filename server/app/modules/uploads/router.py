from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile

from app.core.dependencies import get_current_user

from app.modules.uploads.schema import (
    UploadResourceType,
    UploadResponse,
)

from app.modules.uploads.service import UploadService

from app.shared.services.cloudinary import CloudinaryService


router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
)


def get_upload_service() -> UploadService:

    cloudinary_service = CloudinaryService()

    return UploadService(
        cloudinary_service=cloudinary_service
    )


@router.post(
    "",
    response_model=UploadResponse,
    status_code=201,
)
async def upload_file(
    file: UploadFile = File(...),
    resource_type: UploadResourceType = UploadResourceType.IMAGE,
    current_user=Depends(get_current_user),
    service: UploadService = Depends(get_upload_service),
):

    return await service.upload(
        file=file,
        resource_type=resource_type,
    )