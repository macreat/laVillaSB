# Tasks: MVP Polish Batch

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | WhatsApp tracking + health routes + image + UI | Single PR | `cd app/microservices/notifications && pytest` | All changes in one PR | Revert single commit |

## Phase 1: Backend Infrastructure

- [x] 1.1 Add `DeliveryLog` pydantic model to `app/microservices/notifications/src/main.py` with fields: `phone: str`, `timestamp: datetime`, `products_sent: int`, `status: str`
- [x] 1.2 Add scheduling config to `app/microservices/notifications/src/config.py`: `whatsapp_auto_send_enabled: bool = False`
- [x] 1.3 Add 6 explicit named public health routes in `app/backend/gateway/routes/api.php` BEFORE the auth catch-all: `GET /v1/{service}/health` for catalog, inventory, orders, notifications, payments, users — each with `->name('health.{service}')`

## Phase 2: WhatsApp Auto-Send + Image

- [x] 2.1 Update `send_catalog()` in `app/microservices/notifications/src/main.py`: add `DeliveryLog` construction with phone, timestamp, products_sent, status; return `delivery_log` in response JSON
- [x] 2.2 Convert `app/frontend/public/brand/lavillasb.png` to WebP at 1200px max width (quality 85); delete original PNG
- [x] 2.3 Update `app/frontend/src/lib/brand-manifest.json`: change `lavillaSb.src` to `/brand/lavillasb.webp`

## Phase 3: Frontend UI

- [x] 3.1 Add `logoOG` image to `app/frontend/src/components/store/CookiesConsent.tsx` above MacreatScript — import brand manifest, use `next/image` with the logoOG entry
- [x] 3.2 Add "Developer" column to `app/frontend/src/components/store/StoreFooter.tsx` after Company column — title "Developer", single entry with MacreatScript linked to `https://github.com/Macreat`

## Phase 4: Testing & Verification

- [x] 4.1 Add test for `send_catalog` delivery logging in `app/microservices/notifications/tests/test_send_catalog.py`: mock catalog fetch, assert `delivery_log` in response with correct fields
- [x] 4.2 Verify: `curl GET /api/v1/inventory/health` returns 200 without auth token
- [x] 4.3 Verify: `npm run typecheck` in frontend passes with new image imports
- [x] 4.4 Verify: `pytest` in notifications service passes

## Relevant Files

- `app/microservices/notifications/src/main.py` — add DeliveryLog, update send_catalog response
- `app/microservices/notifications/src/config.py` — add auto-send config
- `app/microservices/notifications/tests/test_send_catalog.py` — new test file
- `app/backend/gateway/routes/api.php` — add named public health routes
- `app/frontend/src/components/store/CookiesConsent.tsx` — add logoOG image
- `app/frontend/src/components/store/StoreFooter.tsx` — add Developer column
- `app/frontend/public/brand/lavillasb.png` → `lavillasb.webp` — convert + replace
- `app/frontend/src/lib/brand-manifest.json` — update lavillaSb entry
