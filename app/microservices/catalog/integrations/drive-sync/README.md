# Drive Sync Service — FastAPI

## Purpose
Synchronizes product data and media references from a Google Drive folder structure into the platform.

## Responsibilities
- Connect to Google Drive API.
- Parse the folder hierarchy: root → categories → product folders → images.
- Detect added, updated, moved, or deleted products.
- Emit product/media discovery events to RabbitMQ.
- Provide a manual sync trigger endpoint for the admin dashboard.

## Internal Structure
```
services/drive-sync/
├── src/
│   ├── main.py
│   ├── config.py
│   ├── clients/
│   │   └── drive_client.py
│   ├── services/
│   │   └── sync_service.py
│   ├── routers/
│   │   └── sync.py
│   └── events/
│       └── publisher.py
├── tests/
└── requirements.txt
```

## Dependencies
- Python 3.12+
- FastAPI, Uvicorn
- Google Drive API v3 (google-api-python-client)
- RabbitMQ client (aio-pika)

## Public Interfaces
- `POST /sync/trigger` — Trigger a manual sync (admin).
- `GET /sync/status` — Get last sync status.

## Configuration
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `RABBITMQ_URL`
- `SYNC_INTERVAL_SECONDS` (for polling mode)

## Inputs
- Google Drive folder contents.
- Manual sync requests.

## Outputs
- `ProductDiscovered`, `ProductUpdated`, `ProductMediaFound` events.
- Sync status records.

## Future Extensions
- Google Drive push notifications (webhooks) instead of polling.
- Conflict resolution UI for admins.
- Support for video and 360° media.
