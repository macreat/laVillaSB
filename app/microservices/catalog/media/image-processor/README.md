# Image Processing Service — FastAPI

## Purpose
Downloads product images from Google Drive, optimizes them, and uploads them to Cloudflare R2.

## Responsibilities
- Consume image processing events from RabbitMQ.
- Download original images from Google Drive.
- Resize and convert images to WebP.
- Generate thumbnails and responsive variants.
- Upload optimized assets to R2.
- Publish completed image URLs back to the catalog.

## Internal Structure
```
services/image-processor/
├── src/
│   ├── main.py
│   ├── config.py
│   ├── services/
│   │   └── processor.py
│   ├── clients/
│   │   ├── drive_client.py
│   │   └── r2_client.py
│   └── events/
│       ├── handlers.py
│       └── publisher.py
├── tests/
└── requirements.txt
```

## Dependencies
- Python 3.12+
- FastAPI, Uvicorn
- Pillow, imageio
- boto3 (for R2/S3-compatible API)
- RabbitMQ client (aio-pika)

## Public Interfaces
- `POST /process` — Trigger image processing for a given image (admin/testing).
- `GET /health` — Health check.

## Configuration
- `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `RABBITMQ_URL`
- Image size presets (e.g., `THUMBNAIL_SIZE`, `FULL_SIZE`)

## Inputs
- `ProductMediaFound` events from Drive Sync Service.
- Manual process requests.

## Outputs
- Optimized image URLs in R2.
- `ImageProcessed` events back to RabbitMQ.

## Future Extensions
- Background removal.
- AI tagging and alt-text generation.
- Video transcoding.
