# Design: MVP Polish Batch

## Technical Approach

Five targeted changes to reach shippable state: WhatsApp catalog auto-send with sender tracking, gateway health-check route fix, cookies banner redesign to small card overlay, footer developer attribution column, and hero image resize from 2000x2000 PNG to optimized WebP. All changes are isolated modifications to existing files with no cross-cutting architectural impact.

## Architecture Decisions

### Decision: WhatsApp Catalog Auto-Send Implementation

**Choice**: Extend existing `/send-catalog` endpoint with sender tracking and scheduled trigger support via background task.
**Alternatives considered**: Separate cron job service; new microservice endpoint.
**Rationale**: The notifications service already has the endpoint and WhatsApp integration. Adding sender tracking (phone, timestamp, products, status) to the existing flow plus a simple background trigger avoids infrastructure overhead.

### Decision: Gateway Health Check Route Fix

**Choice**: Add explicit named public health routes for each service BEFORE the auth-protected catch-all, with explicit route names for priority.
**Alternatives considered**: Modify route priority via `->prioritize()` (Laravel 11+); move catch-all to separate route file.
**Rationale**: Explicit per-service routes are the clearest fix. The current generic `GET /v1/{service}/health` route exists but is shadowed by the `Route::any('/v1/{service}/{path?}')` catch-all in the auth middleware group. Named public routes before the group guarantee matching priority.

### Decision: Cookies Banner - Use macreat-script.png Instead of macreat.jpeg

**Choice**: Use existing `macreat-script.png` (already at `public/brand/macreat-script.png`) as the signature image. The referenced `macreat.jpeg` does not exist in the repo.
**Alternatives considered**: Create macreat.jpeg from existing assets; ask user to provide it.
**Rationale**: The macreat-script.png is already the Macreat signature component used in `MacreatScript.tsx` and in the footer. Using it maintains visual consistency and avoids a missing-asset blocker.

### Decision: Hero Image Resize - WebP at 1200px

**Choice**: Convert `lavillasb.png` (2000x2000 PNG, 5.8MB) to WebP at 1200x1200 max width with quality 85. Update `brand-manifest.json` dimensions.
**Alternatives considered**: Keep PNG and just resize; use Next.js `sizes` prop only.
**Rationale**: WebP at 1200px provides ~80% size reduction. Next.js already serves WebP for other brand assets (villaScene, kunst, lavirgen are all .webp). The `lavillaSb` manifest entry is used in the brand identity grid with `fill` + `object-contain`, so explicit width/height matters for aspect ratio.

## Data Flow

### WhatsApp Catalog Auto-Send

```
POST /api/notifications/send-catalog
  -> notifications/src/main.py: send_catalog()
    -> catalog service: GET /products (fetch product list)
    -> whatsapp.py: format_catalog_message(products)
    -> whatsapp.py: send_whatsapp_message(recipient, message)
    -> Log: {phone, timestamp, products_sent, delivery_status}
  <- Response: {status, message_count, recipient, whatsapp_response}
```

### Health Check Fix

```
Admin Dashboard (admin/page.tsx)
  -> api.proxyGet('inventory', 'health')
    -> GET /api/v1/inventory/health
      -> Laravel routes: public health route (line 21) matches FIRST
      -> ServiceProxyController::proxy() -> inventory:9003/health
    <- {status: "ok"}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/microservices/notifications/src/main.py` | Modify | Add sender tracking model, logging, background trigger support |
| `app/microservices/notifications/src/config.py` | Modify | Add scheduling config (auto-send interval, enabled flag) |
| `app/backend/gateway/routes/api.php` | Modify | Add explicit named public health routes before catch-all |
| `app/frontend/src/components/store/CookiesConsent.tsx` | Modify | Redesign to small centered card with logoOG + MacreatScript signature |
| `app/frontend/src/components/store/StoreFooter.tsx` | Modify | Add "Developer" column with MacreatScript next to "Company" |
| `app/frontend/public/brand/lavillasb.png` | Replace | Convert to WebP at 1200px max width |
| `app/frontend/src/lib/brand-manifest.json` | Modify | Update lavillaSb entry: new src (.webp), width, height |

## Interfaces / Contracts

### POST /api/notifications/send-catalog

```json
// Request: no body (auto-fetches from catalog service)
// Response 200:
{
  "status": "success" | "error",
  "message_count": 42,
  "recipient": "+573245710972",
  "delivery_log": {
    "phone": "+573245710972",
    "timestamp": "2026-08-26T18:00:00Z",
    "products_sent": 42,
    "status": "sent" | "mock_success" | "error"
  },
  "whatsapp_response": { ... }
}
```

### Sender Tracking Model (notifications)

```python
from pydantic import BaseModel
from datetime import datetime

class DeliveryLog(BaseModel):
    phone: str
    timestamp: datetime
    products_sent: int
    status: str  # "sent" | "mock_success" | "error"
```

### Gateway Health Routes (api.php additions)

```php
// Explicit public health routes - MUST be before auth catch-all
Route::get('/v1/catalog/health', [ServiceProxyController::class, 'proxy'])
    ->name('health.catalog');
Route::get('/v1/inventory/health', [ServiceProxyController::class, 'proxy'])
    ->name('health.inventory');
Route::get('/v1/notifications/health', [ServiceProxyController::class, 'proxy'])
    ->name('health.notifications');
```

### CookiesConsent New Layout

```
┌─────────────────────────────┐
│        [logoOG.png]         │
│                             │
│  Performance · Created ·    │
│       Designed by           │
│                             │
│      [MacreatScript]        │
│                             │
│       [ Accept ]            │
└─────────────────────────────┘
Position: fixed bottom-6, centered, max-w-sm
```

### Footer "Developer" Column

```
┌──────────┬──────────┬──────────┬──────────┐
│  Brand   │   Shop   │   Help   │ Company  │
│          │  Decks   │ Contact  │  About   │
│  [logo]  │ Apparel  │ Shipping │  Team    │
│          │  Gear    │ Returns  │ Events   │
│  La Villa│  All     │ Size     │ Dealers  │
│  ...     │          │ Guide    │          │
│          │          │          │ Developer│
│          │          │          │[macreat] │
└──────────┴──────────┴──────────┴──────────┘
```

### brand-manifest.json Update

```json
"lavillaSb": {
  "src": "/brand/lavillasb.webp",
  "width": 1200,
  "height": 1200
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Notifications delivery logging, message formatting | Python tests with mock httpx |
| Integration | Gateway health route priority (public before auth) | Manual curl: `GET /api/v1/inventory/health` without auth token |
| E2E | Admin dashboard shows "Online" for all services | Browser test: admin page renders green status indicators |
| E2E | Cookies banner renders as small card, not fullscreen | Visual check: small centered overlay at bottom |
| E2E | Footer shows Developer column with Macreat logo | Visual check: 4-column layout |
| E2E | Hero image loads without overflow | Visual check: image fits container |

## Threat Matrix

N/A - no routing changes to shell commands, subprocesses, VCS/PR automation, executable-file classification, or process-integration boundaries. The gateway route fix is pure HTTP route priority, not shell/process integration.

## Migration / Rollout

- **WhatsApp**: Add env vars `WHATSAPP_AUTO_SEND_ENABLED=false` (default off). Feature flag controls auto-send behavior. No data migration.
- **Health Checks**: Pure route fix, no migration. Deploy and verify.
- **Cookies Banner**: Client-side only. No server migration. New users see updated banner immediately.
- **Footer**: Client-side only. No migration.
- **Image**: Replace file and update manifest. Next.js Image component auto-optimizes. Old PNG kept as backup in git history.

## Open Questions

- [ ] The `macreat.jpeg` signature file referenced in the proposal does not exist in the repo. Using `macreat-script.png` instead (already in `public/brand/`). Confirm this is acceptable or provide the jpeg.
- [ ] WhatsApp auto-send trigger: proposal asks "schedule, new products, or manual?" - design assumes manual API call with optional scheduled trigger via config flag. Confirm trigger model.
- [ ] `lavillasb.png` is used in the brand identity grid section (line 264-276 of page.tsx). After resize to 1200px, verify the grid display still looks correct at all breakpoints.
