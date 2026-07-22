# Architecture

## Conceptual Architecture

The system is organized into four responsibility layers:

1. **Presentation Layer** — Next.js 15 public storefront and admin dashboard.
2. **Gateway Layer** — Laravel 12 API Gateway handles authentication, authorization, rate limiting, admin session management, and request routing.
3. **Domain Services Layer** — FastAPI microservices own specific business capabilities.
4. **Infrastructure Layer** — PostgreSQL, Redis, RabbitMQ, Meilisearch, Cloudflare R2, Google Drive API.

## Logical Architecture

```
Internet
   │
Cloudflare CDN + DNS
   │
Next.js 15 Frontend (Storefront + Admin)
   │
Laravel 12 API Gateway
   │
   ├───────────┬───────────┬──────────────┬──────────────┐
   │           │           │              │              │
Catalog    Inventory   Cart & WhatsApp  Drive Sync   Image Processing
Service    Service     Service          Service      Service
(FastAPI)  (FastAPI)   (FastAPI)        (FastAPI)    (FastAPI)
   │           │           │              │              │
   └───────────┴───────────┴──────────────┴──────────────┘
                          │
              PostgreSQL  │  Redis  │  Meilisearch
                          │
                    RabbitMQ Event Bus
                          │
                Cloudflare R2 Object Storage
                          │
                Google Drive API (sync source)
```

## Physical Architecture

### Development
Docker Compose runs all services, databases, and the message broker locally.

### Production
Containerized services deployed to a Kubernetes cluster, Cloudflare as CDN and edge proxy, R2 for object storage, and managed PostgreSQL/Redis/RabbitMQ where possible.

## Service Communication

- **Synchronous**: Frontend and admin call the Laravel gateway, which proxies to FastAPI services via REST.
- **Asynchronous**: Services emit domain events to RabbitMQ for decoupled processing (e.g., Drive sync → image processing → catalog update).
