# laVillaSB — v0.1

Software control and API platform for **La Villa Skateboarding**.

A modular, API-first digital backbone powering product catalog, inventory management, order processing, and storefront experience — all containerized and deployable via Docker Compose.

---

## Architecture

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Next.js 14  │       │   Laravel 12     │       │   FastAPI        │
│  Storefront  │◄─────►│   API Gateway    │◄─────►│   Microservices  │
│  Admin Dash  │       │   Auth / Proxy   │       │   (Domain APIs)  │
└──────────────┘       └──────────────────┘       └──────────────────┘
                              │                           │
                              ▼                           ▼
                      ┌──────────────┐           ┌──────────────┐
                      │  PostgreSQL  │           │  PostgreSQL  │
                      │  (Gateway)   │           │  (Services)  │
                      └──────────────┘           └──────────────┘
```

**Infrastructure**: PostgreSQL 16, Redis 7, RabbitMQ 3, Meilisearch v1

---

## Services

| Service | Tech | Port | Description |
|---------|------|------|-------------|
| `frontend` | Next.js 14 | `3000` | Storefront + admin dashboard |
| `gateway` | Laravel 12 | `8010` | API gateway, auth, proxy to microservices |
| `catalog` | FastAPI | `9002` | Products, categories, media |
| `inventory` | FastAPI | `9003` | Stock levels, reservations |
| `orders` | FastAPI | `9004` | Cart, checkout, order lifecycle |

Full list: postgres, redis, rabbitmq, meilisearch, gateway, frontend, catalog, inventory, orders.

---

## Admin Dashboard

Available at `/admin` after authentication:

- **Dashboard** — System overview and service health
- **Products** — Product listing and management
- **Orders** — Order tracking with status badges
- **Inventory** — Stock levels with low-stock alerts
- **Settings** — Profile editor, password change, live microservice health

**Default login**: `admin@lavillasb.com`. The password comes from
`ADMIN_PASSWORD` - `VillaAdmin2026!` by default in local compose, and a value
generated on the server for a production deploy (`grep ADMIN_ /opt/lavillasb/.env`).
It seeds only when the account is first created, so a password changed from the
admin panel survives later deploys.

---

## Quick Start

```bash
git clone <repo-url> && cd laVillaSB
docker compose up -d
```

Services and data are ready within 30 seconds. Visit `http://localhost:3000`.

---

## Deployment

See [docs/reference/deployment.md](docs/reference/deployment.md) for:

- Single VPS with Docker Compose + Caddy reverse proxy
- Docker Swarm for high availability
- Railway / Render / Fly.io PaaS deployment
- Environment variable reference and backup guides

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Gateway | Laravel 12 (PHP 8.3) |
| Frontend | Next.js 14 (Node 20) |
| Microservices | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, RabbitMQ 3 |
| Search | Meilisearch v1 |
| Auth | Laravel Sanctum (Bearer tokens) |
| Orchestration | Docker Compose v2 |

---

## Documentation

- `docs/architecture/` — ADRs, design system, architecture overview
- `docs/operations/` — Development runbook
- `docs/reference/` — Deployment guide
- `app/*/README.md` — Per-service documentation
