# catalog

Product catalog microservice for the laVillaSB platform.

## Purpose

Manage product information, categories, brands, variants, pricing, and media assets for the skateboarding store.

## Responsibilities

- CRUD operations for products, categories, and brands.
- Manage product variants (size, color, edition).
- Store pricing, descriptions, and SEO metadata.
- Handle product media and asset references.
- Publish catalog change events.

## Internal Structure

```
catalog/
├── README.md                 # This file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/       # Products, categories, brands, variants
│   │       └── schemas/      # Pydantic models
│   ├── core/
│   │   ├── config.py
│   │   └── events.py
│   ├── models/               # Product, Category, Brand, Variant, Media
│   ├── services/             # Business logic
│   └── repositories/         # Data access
├── alembic/
├── tests/
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Dependencies

- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL (`catalog_db`)
- Redis (product listing cache)
- S3-compatible object storage (media)

## Public Interfaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products` | GET/POST | List / create products |
| `/api/v1/products/{id}` | GET/PUT/DELETE | Product detail / update |
| `/api/v1/products/{id}/variants` | GET/POST | Product variants |
| `/api/v1/categories` | GET/POST | List / create categories |
| `/api/v1/brands` | GET/POST | List / create brands |
| `/api/v1/search` | GET | Full-text search |

## Inputs

- HTTP requests from the gateway.
- Admin/staff product management actions.
- Bulk import files (CSV/JSON).

## Outputs

- JSON product/category data.
- Catalog change events (ProductCreated, PriceUpdated).
- Media URLs for frontend.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Cache connection |
| `S3_ENDPOINT`, `S3_BUCKET` | Object storage for media |
| `SEARCH_INDEX_NAME` | Optional search index |

## Future Extensions

- Elasticsearch/OpenSearch integration.
- Product recommendation engine.
- Digital asset provenance (blockchain-inspired) for limited editions.
- Multi-language and multi-currency support.
