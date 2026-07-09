# Gateway — Laravel 12

## Purpose
API gateway and backend-for-frontend (BFF) for the laVilla SB platform.

## Responsibilities
- Admin authentication and authorization.
- JWT/session issuance and validation.
- Rate limiting and CORS.
- Routing requests to FastAPI microservices.
- Webhook endpoints (e.g., Drive notifications).
- Queue management for background jobs.
- Future: payment gateway orchestration and customer OAuth.

## Internal Structure
```
gateway/laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/    # Admin, proxy, webhook controllers
│   │   ├── Middleware/     # Auth, rate limit, service routing
│   │   └── Requests/       # Form request validation
│   ├── Models/
│   ├── Providers/
│   └── Services/           # HTTP clients for microservices
├── config/
├── database/
│   └── migrations/
├── routes/
│   ├── api.php             # Public/proxied API routes
│   └── admin.php           # Admin-only routes
└── tests/
```

## Dependencies
- PHP 8.3+
- Laravel 12
- PostgreSQL (for admin users and gateway state)
- Redis (sessions, cache, rate limiting)
- RabbitMQ (queues)

## Public Interfaces
- `POST /admin/login` — Admin login.
- `POST /admin/logout` — Admin logout.
- `GET|POST|PUT|DELETE /api/v1/{service}/*` — Proxied routes to microservices.
- `POST /webhooks/drive` — Google Drive push notifications (future).

## Configuration
Key `.env` variables:
- `APP_KEY`, `DB_*`, `REDIS_*`, `RABBITMQ_*`
- `SERVICE_CATALOG_URL`, `SERVICE_INVENTORY_URL`, etc.
- `WHATSAPP_NUMBER`

## Inputs
- HTTP requests from the Next.js frontend.
- Microservice responses.
- Webhook payloads.

## Outputs
- JSON API responses.
- Proxied service responses.
- Queued jobs.

## Future Extensions
- Customer authentication.
- Payment provider abstraction.
- API versioning and deprecation headers.
