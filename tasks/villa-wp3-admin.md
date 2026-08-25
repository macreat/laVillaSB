# WP3: Admin control room + endpoint-driven UI honesty + bug fixes

Repo: laVillaSB monorepo, work only in `app/frontend`.
Read `docs/architecture/design-system.md` FIRST (admin = "control room of La Villa": villa-ink surfaces, compact density, fox-orange status accents, no illustrations inside data tables).
Depends on WP1 (`src/components/brand/FoxMark.tsx` exists).

## Spec

### 1. Known bugs (fix exactly these)

- `src/app/(dashboard)/admin/settings/page.tsx` health-check `useEffect` has `[]` deps but reads `services` state that is still empty on first run, so health checks NEVER fire; restructure so checks run once the services list exists (derive the list statically, it is a constant).
- `src/app/(dashboard)/admin/page.tsx` `ServiceStatus` receives `url` but renders literal "Check manually"; make it actually ping via the existing proxy health endpoints and render Online/Offline/Checking states.
- `src/app/(dashboard)/admin/page.tsx` also hardcodes `http://localhost:8010/api/admin/me`; route it through the shared `api` client instead.
- `src/components/layout/Sidebar.tsx` uses invalid Tailwind classes `h-4.5 w-4.5`; use `h-5 w-5`.
- `src/lib/api.ts` `request()` calls `res.json()` unconditionally and throws on 204/empty bodies (logout); guard on content-length/content-type.

### 2. Endpoint-driven UI honesty

`GET /api/v1/cart/orders` and `GET /api/v1/inventory/stock` 404 upstream (orders/inventory services are health-only stubs); the admin pages currently treat this as a generic error.
Requirement: distinguish three states in `admin/orders` and `admin/inventory` pages: loading (skeleton rows), service-unavailable (labeled "SERVICE OFFLINE" panel with the villa-smoke micro-label treatment and a retry button; triggered by 404/502/503 or network failure), and true empty (styled empty state with `stickerFox` accent from `src/lib/brand-manifest.json`, `aria-hidden` on the art).
Do NOT change any API contract; the UI adapts to what exists.

### 3. Control-room visual pass

Scope: `(dashboard)` layout, `Sidebar`, `TopBar`, `StatCard`, and the four admin pages.
- Sidebar: `FoxMark` (done in WP1), nav items as uppercase micro-labels (Archivo, tracking-[0.12em], 12px), active item gets a 2px fox-orange left rule, compact 40px rows.
- TopBar: page title in font-display uppercase; remove the decorative notification bell entirely (it is a lie: no notifications exist).
- StatCards: hard-edged (`card` class is already rounded-none), tabular-nums for values, fox-orange delta accents; placeholder dashes stay until real data exists.
- Tables: denser rows (py-2.5), header row as uppercase micro-labels, 1px villa-smoke/25 rules, `<caption class="sr-only">` describing each table, `scope="col"` on headers.
- Status colors: map to villa palette (fox=pending/attention, slime is FORBIDDEN in admin, use teal for info, `villa-blood` for failures, keep green-500 for success).
- Responsive admin: `(dashboard)/layout.tsx` hardcodes `ml-64` with a fixed sidebar; make the sidebar an off-canvas drawer under `lg:` (hamburger in TopBar, focus-trapped, Escape closes, `aria-expanded`), content full-width on mobile.

### 4. Loading/error/empty consistency

Every admin page must render: skeletons while loading (no spinners-only), the service-offline panel on upstream failure, and accessible announcements (`role="status"` on loading, `aria-live="polite"` on error text).

## Constraints

- Do not touch auth logic, api endpoints, store pages, or backend code (a separate package owns auth).
- English-only UI copy. Match existing code style. No new dependencies.
- Aim under 500 changed lines.

## Verify (must pass)

```
cd app/frontend
npm run typecheck && npm run lint && npm run test && npm run build
```

Add unit tests for the api client 204 guard and for the three-state classification logic (extract it into `src/lib/service-state.ts` and test that; no jsdom).
Commit in small conventional-commit steps; never add a co-author line.
