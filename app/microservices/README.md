# microservices

FastAPI domain microservices for the laVillaSB platform.

## Purpose

Decompose the platform into small, autonomous services that each own a single business domain. Services expose REST APIs consumed by the Laravel gateway and produce events for async workflows.

## Responsibilities

- Implement business logic per domain.
- Expose well-defined REST endpoints with OpenAPI specs.
- Own private data stores and schemas.
- Publish and subscribe to domain events.
- Scale independently based on workload.

## Internal Structure

```
microservices/
├── README.md                 # This file
├── users/                    # Identity, authentication, profiles
├── catalog/                  # Product catalog and categories
├── inventory/                # Stock and reservations
├── orders/                   # Shopping cart and orders
├── payments/                 # Payment processing
└── notifications/            # Email, SMS, push notifications
```

## Dependencies

- Python 3.11+
- FastAPI + Uvicorn
- SQLModel / SQLAlchemy
- PostgreSQL (per service)
- Redis (cache and pub/sub)
- RabbitMQ or NATS (event bus)
- Laravel gateway (consumer)

## Public Interfaces

Each service exposes:

- REST API on a dedicated port.
- Auto-generated OpenAPI docs at `/docs`.
- Health endpoint at `/health`.
- Event consumers and producers.

## Inputs

- HTTP requests from the gateway.
- Events from other microservices.
- Webhooks from external providers (payments, shipping).

## Outputs

- JSON API responses.
- Domain events published to the message broker.
- Database changes.

## Configuration

- `APP_ENV`, `DATABASE_URL`, `REDIS_URL`, `BROKER_URL`.
- Service-specific API keys and secrets.

## Future Extensions

- Add search microservice (Elasticsearch/OpenSearch).
- Add analytics/telemetry microservice.
- Implement sagas for distributed transactions.
- Migrate to gRPC for internal inter-service calls.

---

## Service Registry

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| users | 9001 | users_db | Identity, auth, profiles |
| catalog | 9002 | catalog_db | Products, categories, media |
| inventory | 9003 | inventory_db | Stock levels, reservations |
| orders | 9004 | orders_db | Cart, checkout, orders |
| payments | 9005 | payments_db | Payment intents, refunds |
| notifications | 9006 | notifications_db | Notifications and templates |
