import json
from urllib.parse import quote
from uuid import uuid4

import boto3

from .config import settings


def build_storage_key(filename: str) -> str:
    safe_name = filename.strip().replace(" ", "-")
    return f"uploads/{uuid4().hex}/{safe_name}"


def build_public_url(storage_key: str) -> str:
    key = quote(storage_key)
    if settings.cdn_base_url:
        return f"{settings.cdn_base_url.rstrip('/')}/{key}"
    return f"{settings.s3_endpoint_url.rstrip('/')}/{settings.s3_bucket}/{key}"


def build_put_url(storage_key: str) -> str:
    return f"{settings.s3_endpoint_url.rstrip('/')}/{settings.s3_bucket}/{quote(storage_key)}"


def ensure_public_bucket() -> None:
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        region_name=settings.s3_region,
    )
    try:
        s3.head_bucket(Bucket=settings.s3_bucket)
    except Exception:
        s3.create_bucket(Bucket=settings.s3_bucket)

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": f"arn:aws:s3:::{settings.s3_bucket}/*",
            }
        ],
    }
    s3.put_bucket_policy(Bucket=settings.s3_bucket, Policy=json.dumps(policy))
