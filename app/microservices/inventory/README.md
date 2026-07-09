# inventory

Inventory management microservice for the laVillaSB platform.

## Purpose

Track stock levels across warehouses, reserve inventory during checkout, and prevent overselling.

## Responsibilities

- Maintain SKU-level stock quantities.
- Reserve and release inventory for orders.
- Manage warehouse locations and stock movements.
- Provide availability checks to the catalog and orders services.
- Emit low-stock and stock-movement events.

## Internal Structure

```
inventory/
├── README.md                 # This file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/       # Stock, reservations, warehouses
│   │       └── schemas/      # Pydantic models
│   ├── core/
│   │   ├── config.py
│   │   └── events.py
│   ├── models/               # StockItem, Reservation, Warehouse, Movement
│   ├── services/             # Reservation engine
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
- PostgreSQL (`inventory_db`)
- Redis (distributed locks for reservations)
- Message broker (RabbitMQ/Redis) for events

## Public Interfaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/stock` | GET/POST | Query / adjust stock |
| `/api/v1/stock/{sku}` | GET | Stock for SKU |
| `/api/v1/reservations` | POST | Reserve inventory |
| `/api/v1/reservations/{id}/commit` | POST | Commit reservation |
| `/api/v1/reservations/{id}/release` | POST | Release reservation |
| `/api/v1/warehouses` | GET/POST | Warehouse management |
| `/api/v1/movements` | GET/POST | Stock movements |

## Inputs

- Gateway requests for availability and reservations.
- Order events from orders service.
- Admin stock adjustments.

## Outputs

- Stock availability responses.
- Reservation results.
- LowStock, StockAdjusted events.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Locking and cache |
| `BROKER_URL` | Event broker |
| `RESERVATION_TTL_SECONDS` | Reservation timeout |

## Future Extensions

- Multi-warehouse fulfillment optimization.
- Real-time inventory sync with POS systems.
- Predictive reordering and demand forecasting.
- Barcode/RFID integration.
