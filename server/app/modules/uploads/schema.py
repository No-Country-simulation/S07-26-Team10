from enum import Enum

from pydantic import BaseModel, ConfigDict


class UploadResourceType(str, Enum):
    IMAGE = "image"
    FILE = "raw"


class UploadResponse(BaseModel):
    """
    Respuesta luego de subir un archivo a Cloudinary.
    """

    url: str
    public_id: str
    resource_type: UploadResourceType
    width: int | None = None
    height: int | None = None

    model_config = ConfigDict(
        from_attributes=True
    )