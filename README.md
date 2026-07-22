# laVillaSB

Software control and API platform for **La Villa Skateboarding**.

## Purpose

Provide a scalable, modular, API-first digital backbone for La Villa Skateboarding business operations: product catalog, inventory, orders, payments, users, notifications, and storefront experience.

## Conceptual Architecture

**Business domains**

| Domain | Capability |
|--------|------------|
| Identity | User registration, authentication, profiles, roles |
| Catalog | Product information, categories, media, pricing |
| Inventory | Stock levels, reservations, warehouses |
| Orders | Cart, checkout, order lifecycle, shipments |
| Payments | Payment processing, refunds, receipts |
| Notifications | Email, SMS, push notifications |
| Storefront | Customer-facing web application |

**Actors**

- Customer: browse catalog, place orders, manage profile.
- Staff: manage products, inventory, orders.
- Admin: configure tenants, users, integrations.
- External systems: payment providers, shipping carriers, analytics.

## Logical Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js       │      │  Laravel Gateway │      │  FastAPI        │
│   Frontend      │◄────►│  (API Gateway)   │◄────►│  Microservices  │
│   (Storefront)  │      │  Auth/Routing    │      │  (Domain APIs)  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                │                            │
                                ▼                            ▼
                        ┌──────────────┐            ┌──────────────┐
                        │  PostgreSQL  │            │  PostgreSQL  │
                        │  (Gateway)   │            │  (Services)  │
                        └──────────────┘            └──────────────┘
```

The **gateway** centralizes authentication, routing, rate limiting, and protocol translation. Microservices are autonomous, domain-focused, and communicate with the gateway over HTTP/REST.

## Physical Architecture

```
laVillaSB/
├── app/
│   ├── backend/gateway   # Laravel 12-13 API gateway
│   ├── frontend          # Next.js storefront
│   └── microservices/    # FastAPI domain services
├── docs/                 # Architecture and runbook docs
└── tools/                # Scripts, dev tools, CI helpers
```

## Technology Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Gateway | Laravel 12-13 | Mature PHP ecosystem, robust auth, queues, migrations |
| Frontend | Next.js | SSR/SSG, React ecosystem, Vercel-ready |
| Microservices | FastAPI | Async Python, auto OpenAPI, high throughput |
| API Style | REST + OpenAPI | Industry-standard, tool-rich |
| Messaging | RabbitMQ / Redis | Async jobs, event-driven decoupling |
| Primary DB | PostgreSQL | Relational consistency, JSON support |
| Cache | Redis | Sessions, rate limits, hot data |
| Object Storage | S3-compatible | Product media, exports |

## Public Interfaces

- `https://api.lavillaskateboarding.com` — Gateway REST API.
- `https://lavillaskateboarding.com` — Next.js storefront.
- OpenAPI specs published under `/docs/openapi/`.

## MVP Focus (Current Merge Baseline)

- Dark, skate-style storefront UX inspired by Creature/Santa Cruz references.
- Catalog browsing + cart-to-WhatsApp manual checkout.
- Admin-ready backend foundation via Laravel gateway + FastAPI services.
- Google Drive product media sync strategy documented in:
  - `docs/architecture/architecture.md`
  - `docs/operations/development-runbook.md`

## Inputs

- Customer actions (web, mobile).
- Admin/staff operations.
- Webhooks from payment providers and shipping carriers.
- Scheduled batch jobs (reports, cleanup).

## Outputs

- Web responses (HTML/JSON).
- Email/SMS/push notifications.
- Webhook callbacks to integrations.
- Audit logs and analytics events.

## Configuration

- Environment variables per service (`.env.example` in each app).
- Centralized feature flags via gateway configuration.
- Docker Compose for local orchestration.

## Future Extensions

- Mobile app consuming gateway API.
- GraphQL federation layer.
- Event sourcing for order/payment history.
- Blockchain-inspired provenance for limited-edition product authenticity.
- AI-powered product recommendations.

## Getting Started

1. Clone the repository.
2. Copy `.env.example` to `.env` in each service.
3. Run `docker compose up` from the root.
4. Open `http://localhost:3000` for the storefront.
5. Gateway API available at `http://localhost:8080`.

## Documentation

- `docs/` — Architecture decision records, runbooks, API guides.
- Each `README.md` under `app/` describes a service or module.
- `docs/architecture/design-system.md` — Visual design tokens and UI direction.
