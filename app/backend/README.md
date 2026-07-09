# backend

Backend components of the laVillaSB platform.

## Purpose

Provide server-side capabilities for the platform, including the central API gateway that routes requests, enforces security, and orchestrates calls to domain microservices.

## Responsibilities

- Authenticate and authorize users.
- Route external requests to the correct microservice.
- Aggregate responses from multiple services when needed.
- Enforce rate limiting, request validation, and logging.
- Manage shared concerns: sessions, caching, feature flags.

## Internal Structure

```
backend/
├── README.md                 # This file
└── gateway/                  # Laravel API gateway
```

## Dependencies

- PHP 8.3+ with Laravel 12-13.
- PostgreSQL for gateway data (users, sessions, audit logs).
- Redis for caching and session storage.
- RabbitMQ/Redis for async jobs.
- FastAPI microservices for domain logic.

## Public Interfaces

- REST API exposed at `https://api.lavillaskateboarding.com`.
- OpenAPI specification served at `/docs/openapi.yaml`.

## Inputs

- HTTP requests from the Next.js frontend.
- Webhooks from payment/shipping providers.
- Internal events from microservices.

## Outputs

- JSON responses to clients.
- Jobs dispatched to queues.
- Audit and security events.

## Configuration

- Laravel `.env` variables: `DB_CONNECTION`, `REDIS_HOST`, `QUEUE_CONNECTION`, etc.
- Microservice base URLs configured per environment.
- OAuth2/JWT secrets for authentication.

## Future Extensions

- Add admin dashboard backend.
- Implement GraphQL gateway alongside REST.
- Introduce API versioning and deprecation workflows.
