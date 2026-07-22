# Deployment

## Prerequisites

- Docker and Docker Compose v2 installed on the target host
- A domain name (if deploying with a reverse proxy)
- Git access to the repository

---

## Option 1: Single VPS with Docker Compose

Recommended for MVP, staging, or low-to-medium traffic production.

### 1. Provision a server

Any Linux VPS with Docker installed works. Minimum recommended: 2 vCPU, 4 GB RAM, 40 GB SSD.

### 2. Clone and deploy

```bash
git clone <repo-url> /opt/lavillaskateboarding
cd /opt/lavillaskateboarding/laVillaSB
docker compose up -d
```

All 9 services start: postgres, redis, rabbitmq, meilisearch, gateway, catalog, inventory, orders, frontend.

### 3. Production overrides

Before deploying to production, create `docker-compose.override.yml` (or use `docker-compose.prod.yml` with `-f`):

```yaml
services:
  gateway:
    environment:
      APP_ENV: production
      APP_DEBUG: "false"
      # Replace with a real key (generate via `php artisan key:generate --show`)
      APP_KEY: "base64:<real-key>"
      DB_PASSWORD: "${DB_PASSWORD}"
      SERVICE_DRIVE_SYNC_URL: "${SERVICE_DRIVE_SYNC_URL}"
      SERVICE_IMAGE_PROCESSOR_URL: "${SERVICE_IMAGE_PROCESSOR_URL}"

  postgres:
    environment:
      POSTGRES_PASSWORD: "${DB_PASSWORD}"

  rabbitmq:
    environment:
      RABBITMQ_DEFAULT_PASS: "${RABBITMQ_DEFAULT_PASS}"

  meilisearch:
    environment:
      MEILI_MASTER_KEY: "${MEILI_MASTER_KEY}"
```

Use a `.env` file (never commit it) for secrets:

```
DB_PASSWORD=<random-64-char>
RABBITMQ_DEFAULT_PASS=<random-32-char>
MEILI_MASTER_KEY=<random-32-char>
```

### 4. Add a reverse proxy

Exposing raw ports is not production-safe. Add a Caddy or nginx service to the compose file:

#### Caddy (recommended — auto TLS)

```yaml
services:
  caddy:
    image: caddy:2-alpine
    container_name: lavilla_caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    networks: [lavilla]

volumes:
  caddy_data:
```

`Caddyfile`:

```
example.com {
    reverse_proxy frontend:3000
}

api.example.com {
    reverse_proxy gateway:8010
}
```

#### nginx

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: lavilla_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    networks: [lavilla]
```

### 5. Gateway production server

The current gateway Dockerfile uses `php artisan serve` (a development server). For production, replace it with a proper setup:

**Option A — PHP-FPM + Nginx sidecar** (recommended): Add an nginx container that reverse-proxies to the gateway on an internal FPM port.

**Option B — Roadrunner / Swoole**: Install a PHP application server within the gateway container and replace the CMD.

Sample production gateway Dockerfile adjustments:

```dockerfile
# Add to runner stage
RUN mv /usr/local/etc/php/php.ini-development /usr/local/etc/php/php.ini
COPY --from=builder /app /app
# Instead of artisan serve, use php-fpm or roadrunner
```

---

## Option 2: Docker Swarm

For high availability across multiple nodes.

### Prerequisites

- 3+ nodes (managers + workers)
- Shared storage (NFS, EFS, or similar) for persistent volumes
- Overlay network

### Deploy

```bash
docker stack deploy -c laVillaSB/docker-compose.yml lavilla
```

Notes:
- Replace `container_name` with `deploy:` configuration
- Add `deploy.replicas` for each service
- Persistent volumes need a Swarm-compatible driver (e.g. `rexray` or cloud-native CSI)

---

## Option 3: PaaS (Railway / Render / Fly.io)

### Railway (easiest)

1. Connect the repo to Railway
2. Railway auto-detects `docker-compose.yml` and creates one service per container
3. Add environment variables per service in the Railway dashboard
4. Railway provides HTTPS and domains automatically

### Render

1. Create a Blueprint from the repo, or add each service manually as a "Docker" service
2. Set environment variables in the Render dashboard
3. Render handles TLS via automatic Let's Encrypt

### Fly.io

1. Install `flyctl` and authenticate
2. Run `fly launch` in each service directory to generate a `fly.toml`
3. Deploy each service with `fly deploy`
4. Requires a `fly.toml` per microservice (no single docker-compose import)

---

## Environment Variables Reference

| Variable | Service | Description |
|---|---|---|
| `APP_ENV` | gateway | `production`, `staging`, `local` |
| `APP_DEBUG` | gateway | `true` or `false` |
| `APP_KEY` | gateway | Laravel app key (32-char base64) |
| `DB_HOST` | gateway | PostgreSQL hostname |
| `DB_DATABASE` | gateway | Database name |
| `DB_USERNAME` | gateway | Database user |
| `DB_PASSWORD` | gateway, postgres | Database password |
| `REDIS_HOST` | gateway, orders | Redis hostname |
| `RABBITMQ_DEFAULT_USER` | rabbitmq | RabbitMQ username |
| `RABBITMQ_DEFAULT_PASS` | rabbitmq | RabbitMQ password |
| `MEILI_MASTER_KEY` | meilisearch | Meilisearch master key |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | Public API URL (e.g. `https://api.example.com`) |
| `NEXT_PUBLIC_SITE_URL` | frontend | Public site URL (e.g. `https://example.com`) |
| `API_INTERNAL_URL` | frontend | Internal gateway URL (`http://gateway:8010`) |

---

## Health Checks

All infrastructure and application services include Docker health checks. Monitor with:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

For external monitoring, expose health endpoints at `/health` on each service and route through the reverse proxy.

---

## Backup

### PostgreSQL

```bash
docker exec lavilla_postgres pg_dump -U lavilla lavilla > backup.sql
```

### Redis

```bash
docker exec lavilla_redis redis-cli SAVE
```

### Volumes

Data volumes are stored at `/var/lib/docker/volumes/`. To back them up:

```bash
tar -czf lavilla-volumes.tar.gz /var/lib/docker/volumes/lavillasb_*
```
