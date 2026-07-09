# app

Application layer of the laVillaSB platform.

## Purpose

Host all runnable software components: the customer-facing storefront, the API gateway, and the domain microservices. Each subdirectory is an independently deployable unit with a single, well-defined responsibility.

## Responsibilities

- Expose customer-facing UI through the frontend.
- Centralize API access, authentication, and routing via the gateway.
- Implement business capabilities in focused microservices.
- Enforce bounded contexts and clear interfaces between services.

## Internal Structure

```
app/
├── README.md                 # This file
├── backend/
│   ├── README.md             # Backend logical overview
│   └── gateway/              # Laravel API gateway
├── frontend/                 # Next.js storefront
└── microservices/            # FastAPI domain services
```

## Dependencies

- Docker and Docker Compose for local execution.
- PostgreSQL and Redis shared infrastructure.
- RabbitMQ or Redis for async messaging.

## Public Interfaces

- `app/frontend` serves HTTP on port `3000`.
- `app/backend/gateway` serves HTTP on port `8080`.
- `app/microservices/*` serve HTTP on ports `9000+`.

## Inputs

- Customer and staff HTTP requests.
- Webhooks from external providers.
- Internal events and scheduled jobs.

## Outputs

- HTML/JSON responses.
- Database mutations.
- Notifications and integration events.

## Configuration

- Each service owns its `.env.example` and runtime configuration.
- Shared settings (database host, broker URL) come from environment variables.

## Future Extensions

- Add a BFF (Backend-for-Frontend) service for mobile.
- Introduce service mesh for inter-service communication.
- Split gateway into public and internal gateways.
