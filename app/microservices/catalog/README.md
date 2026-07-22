# Catalog Service — FastAPI

## Purpose
Manages product and category information for the laVilla SB catalog.

## Responsibilities
- Product CRUD.
- Category management.
- Product attributes and variants.
- Search index synchronization with Meilisearch.
- Consume product discovery events from Drive Sync Service.

## Internal Structure
```
services/catalog/
├── src/
│   ├── main.py             # FastAPI application entrypoint
│   ├── config.py           # Settings and environment
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic request/response models
│   ├── routers/
│   │   ├── products.py
│   │   └── categories.py
│   ├── services/
│   │   └── product_service.py
│   ├── events/
│   │   └── handlers.py     # RabbitMQ consumers
│   └── database.py         # PostgreSQL connection
├── tests/
└── requirements.txt
```

## Dependencies
- Python 3.12+
- FastAPI, Uvicorn
- SQLAlchemy, asyncpg
- Pydantic
- Meilisearch Python client
- RabbitMQ client (aio-pika)

## Public Interfaces
- `GET /products` — List products.
- `GET /products/{id}` — Get product details.
- `POST /products` — Create product (admin).
- `PUT /products/{id}` — Update product (admin).
- `DELETE /products/{id}` — Archive product (admin).
- `GET /categories` — List categories.
- `GET /search?q=...` — Search products.

## Configuration
- `DATABASE_URL`
- `MEILISEARCH_URL`, `MEILISEARCH_API_KEY`
- `RABBITMQ_URL`

## Inputs
- Admin CRUD requests.
- `ProductDiscovered` / `ProductUpdated` events from Drive Sync.
- Search indexing commands.

## Outputs
- Product JSON responses.
- Meilisearch index updates.
- Domain events for inventory and image processing.

## Future Extensions
- Recommendation integration.
- AI-generated descriptions.
- Product reviews and ratings.
