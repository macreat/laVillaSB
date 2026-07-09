# Development & Deployment Runbook

This document contains the manual steps to run, test, and continuously develop the laVilla SB platform locally.

## Prerequisites

- **PHP 8.3+** with extensions: `openssl`, `fileinfo`, `mbstring`, `pdo_pgsql`
- **Composer**
- **Python 3.12+**
- **Node.js 20+**
- **Docker Desktop** (for PostgreSQL, Redis, RabbitMQ, Meilisearch)

## PHP Extension Notes (Windows / Scoop)

If you installed PHP via Scoop, create `php.ini` from `php.ini-production` and enable:

```ini
extension=openssl
extension=fileinfo
extension=mbstring
extension=pdo_pgsql
```

Redis (`phpredis`) is optional for local development; the gateway currently uses file sessions and file cache to avoid the extra extension.

## 1. Start Local Infrastructure

```powershell
cd infrastructure
docker compose up -d
```

Services exposed on localhost:

| Service | Port | Management UI |
|---------|------|---------------|
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |
| RabbitMQ | 5672 | http://localhost:15672 (guest/guest) |
| Meilisearch | 7700 | http://localhost:7700 |

## 2. Laravel API Gateway

```powershell
cd gateway/laravel
copy .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan serve --host=127.0.0.1 --port=8010
```

Default admin credentials:
- Email: `admin@lavillasb.com`
- Password: `password`

Test login:

```powershell
curl -s -X POST http://127.0.0.1:8010/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@lavillasb.com","password":"password","device_name":"dev"}'
```

## 3. FastAPI Microservices

Each service runs independently. Example for the catalog service:

```powershell
cd services/catalog
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

Recommended ports:

| Service | Port |
|---------|------|
| Catalog | 8001 |
| Inventory | 8002 |
| Cart | 8003 |
| Drive Sync | 8004 |
| Image Processor | 8005 |

## 4. Next.js Frontend

### Storefront

```powershell
cd frontend/apps/storefront
npm install
npm run dev
```

### Admin Dashboard

```powershell
cd frontend/apps/admin
npm install
npm run dev
```

## 5. Testing the WhatsApp Flow

1. Add products to the cart in the storefront.
2. Click **Order via WhatsApp**.
3. The frontend requests the cart checkout link from the gateway/cart service.
4. The browser opens `https://wa.me/<number>?text=<cart summary>`.
5. The customer completes the order manually with the admin.

## 6. Google Drive Sync

1. Create a Google Cloud service account and download the JSON key.
2. Place the key at `gateway/laravel/service-account.json` (or set `GOOGLE_SERVICE_ACCOUNT_JSON_PATH`).
3. Share the product Drive folder with the service account email.
4. Set `GOOGLE_DRIVE_FOLDER_ID` in `.env`.
5. Trigger sync from the admin dashboard or via:

```powershell
curl -s -X POST http://127.0.0.1:8010/api/v1/drive-sync/sync/trigger `
  -H "Authorization: Bearer <token>"
```

## 7. Useful Docker Commands

```powershell
# View logs
docker compose logs -f postgres

# Restart a service
docker compose restart meilisearch

# Stop everything
docker compose down

# Stop and remove volumes (warning: deletes local data)
docker compose down -v
```

## 8. Continuous Development Workflow

1. Start infrastructure: `docker compose up -d`.
2. Start the gateway: `php artisan serve --port=8010`.
3. Start the services you are working on (usually catalog + cart).
4. Start the frontend app you are working on.
5. Run migrations and seeders after pulling changes.
6. Keep `requirements.txt`, `composer.json`, and `package.json` updated when adding dependencies.

## 9. Future Production Deployment

1. Build Docker images for each service.
2. Push to a container registry.
3. Deploy to Kubernetes or a managed container platform.
4. Use Cloudflare as the CDN and edge proxy.
5. Use Cloudflare R2 or AWS S3 for object storage.
6. Use managed PostgreSQL, Redis, and RabbitMQ services.
