# Inventory Service — FastAPI

## Purpose
Tracks stock levels and availability for catalog products.

## Responsibilities
- Stock level CRUD per SKU.
- Availability queries.
- Low-stock event publishing.
- Consume product creation events to initialize stock records.

## Internal Structure
```
services/inventory/
├── src/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── stock.py
│   │   └── availability.py
│   ├── services/
│   │   └── stock_service.py
│   └── events/
│       └── handlers.py
├── tests/
└── requirements.txt
```

## Dependencies
- Python 3.12+
- FastAPI, Uvicorn
- SQLAlchemy, asyncpg
- RabbitMQ client (aio-pika)

## Public Interfaces
- `GET /inventory/{product_id}` — Get stock level.
- `POST /inventory/{product_id}/adjust` — Adjust stock (admin).
- `GET /availability?ids=...` — Batch availability check.

## Configuration
- `DATABASE_URL`
- `RABBITMQ_URL`

## Inputs
- Admin stock adjustments.
- `ProductCreated` events from Catalog Service.
- Cart reservation requests (future).

## Outputs
- Stock JSON responses.
- `LowStock` events to RabbitMQ.

## Future Extensions
- Real-time reservations during checkout.
- Multi-warehouse support.
- Stock history and audit log.
