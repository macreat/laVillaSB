# gateway

Laravel 12-13 API Gateway for the laVillaSB platform.

## Purpose

Serve as the single entry point for all client-facing API traffic. The gateway authenticates requests, applies cross-cutting policies, and proxies or orchestrates calls to FastAPI microservices.

## Responsibilities

- Authenticate users via OAuth2 / JWT / Laravel Sanctum.
- Authorize requests based on roles and scopes.
- Validate incoming payloads and translate protocols.
- Route requests to the appropriate microservice.
- Aggregate microservice responses for composite endpoints.
- Enforce rate limiting, throttling, and CORS.
- Cache frequently accessed data with Redis.
- Produce audit logs and security events.

## Internal Structure

```
gateway/
├── README.md                 # This file
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Gateway controllers
│   │   ├── Middleware/       # Auth, rate limit, request ID
│   │   └── Requests/         # Form request validation
│   ├── Models/               # Gateway domain models (User, Session, Audit)
│   ├── Services/             # Microservice clients
│   └── Providers/            # Service providers
├── bootstrap/
├── config/                   # Laravel configuration
├── database/
│   ├── migrations/           # Gateway schema migrations
│   └── seeders/              # Default data
├── routes/
│   ├── api.php               # API routes
│   └── web.php               # Web routes
├── tests/                    # Feature and unit tests
└── .env.example              # Environment template
```

## Dependencies

- PHP 8.3+
- Laravel 12-13
- Composer
- PostgreSQL
- Redis
- RabbitMQ or Redis queue driver
- FastAPI microservices (users, catalog, inventory, orders, payments, notifications)

## Public Interfaces

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/login` | Authenticate user |
| `POST /api/v1/auth/register` | Register user |
| `GET /api/v1/me` | Current user profile |
| `GET /api/v1/products` | List products (proxied to catalog) |
| `POST /api/v1/orders` | Create order (orchestrated) |
| `GET /api/v1/orders/{id}` | Get order details |
| `POST /api/v1/payments` | Process payment |
| `GET /docs/openapi.yaml` | OpenAPI specification |

## Inputs

- HTTP requests from Next.js frontend.
- Webhooks from Stripe, PayPal, shipping carriers.
- Internal callbacks from microservices.

## Outputs

- JSON HTTP responses.
- Queue jobs dispatched to workers.
- Audit log entries in PostgreSQL.

## Configuration

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | Environment name |
| `DB_CONNECTION`, `DB_HOST`, `DB_DATABASE` | PostgreSQL connection |
| `REDIS_HOST`, `REDIS_PASSWORD` | Redis connection |
| `QUEUE_CONNECTION` | Queue driver |
| `SERVICES_USERS_URL` | Users microservice base URL |
| `SERVICES_CATALOG_URL` | Catalog microservice base URL |
| `SERVICES_INVENTORY_URL` | Inventory microservice base URL |
| `SERVICES_ORDERS_URL` | Orders microservice base URL |
| `SERVICES_PAYMENTS_URL` | Payments microservice base URL |
| `SERVICES_NOTIFICATIONS_URL` | Notifications microservice base URL |
| `JWT_SECRET` / `SANCTUM_STATEFUL_DOMAINS` | Auth secrets |

## Future Extensions

- Implement GraphQL gateway for mobile and web clients.
- Add request/response transformation pipelines.
- Introduce API productization and developer portal.
- Support multi-tenant routing and tenant isolation.
