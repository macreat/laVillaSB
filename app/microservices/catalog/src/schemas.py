from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    sku: str | None = None
    price: Decimal
    category: str | None = None
    categoryGroup: str
    categorySubcategory: str | None = None
    active: bool
    created_at: datetime
    updated_at: datetime
    imageUrl: str | None = None


class MediaPresignRequest(BaseModel):
    filename: str
    contentType: str


class MediaPresignResponse(BaseModel):
    mediaId: int
    uploadUrl: str
    method: str = "PUT"
    headers: dict[str, str]
    fields: dict[str, str] = {}
    expiresIn: int
    objectKey: str


class MediaCompleteRequest(BaseModel):
    variants: dict


class MediaCompleteResponse(BaseModel):
    id: int
    status: str
    variants: dict | None = None
