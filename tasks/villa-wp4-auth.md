# WP4: Admin auth hardening (Laravel gateway + Next middleware)

Repo: laVillaSB monorepo.
Scope: `app/backend/gateway` plus exactly two frontend files (`app/frontend/middleware.ts` new, `app/frontend/src/lib/api.ts` and `src/lib/auth.tsx` cookie line, see 4).
Current state: Sanctum bearer tokens, `AdminAuthController` (login/logout/me/updateProfile), NO roles, NO rate limiting, tokens never expire, seeder hardcodes `admin@lavillasb.com`/`password`, admin routes only guarded client-side.

## Spec

### 1. Admin authorization (gateway)

- Migration: add `is_admin` boolean (default false) to `users`; seeder sets it true for the admin user.
- Login (`AdminAuthController@login`): after password check, reject non-admin users with the same generic 422 message used for bad credentials (no user enumeration); issue the token with ability `admin`.
- New middleware `EnsureAdmin` (checks `$request->user()->is_admin` and `tokenCan('admin')`), applied to `GET/PUT /api/admin/me`, `POST /api/admin/logout`, and the authenticated proxy route group in `routes/api.php`.
- The public catalog allowlist route stays untouched.

### 2. Token lifecycle + rate limiting (gateway)

- `config/sanctum.php` expiration: 720 (12h) via `SANCTUM_TOKEN_EXPIRATION` env with that default; add the env to `.env.example`.
- Login route: `throttle:5,1` (5 attempts/minute per IP).
- Logout: also delete expired tokens of the current user (housekeeping, one query).

### 3. Credential hygiene

- `AdminUserSeeder`: read email/password from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env; if `ADMIN_PASSWORD` is unset, generate a random 24-char password and write it to the log ONCE (never to the response); keep idempotency (updateOrCreate on email).
- Add both envs to `gateway/.env.example` with empty values and a comment.
- docker-compose.yml: pass `ADMIN_EMAIL`/`ADMIN_PASSWORD` through to the gateway service from the host environment (empty default), do not hardcode values.

### 4. Server-side route gating (frontend, minimal)

- On login success the frontend also sets a non-httpOnly cookie `lavilla_session=1; Path=/; SameSite=Lax` (plus `Secure` when on https), and clears it on logout: implement in `src/lib/api.ts` login/logout (or `auth.tsx`, wherever token storage already lives).
- New `app/frontend/middleware.ts`: requests to `/admin/:path*` without the `lavilla_session` cookie redirect to `/login`; `/login` with the cookie redirects to `/admin`.
- This is a UX gate, not the security boundary; the security boundary is the gateway (`auth:sanctum` + `EnsureAdmin`). State this in a comment at the top of middleware.ts.

### 5. Tests (PHPUnit, Feature)

Cover: login success returns token for admin, non-admin login rejected with generic message, throttle kicks in after 5 attempts, `me` requires auth, `me` rejects non-admin token, logout revokes token, updateProfile requires current_password for password change, expired tokens rejected (travel time).
Follow the existing style of `tests/Feature/CatalogPublicRoutesTest.php` (sqlite :memory:).

## Constraints

- Do not refactor the proxy controller, CORS, or session config beyond the spec.
- Do not touch any other frontend file; the admin UI package runs in parallel.
- Conventional commits (`feat(gateway): ...`, `test(gateway): ...`); never add a co-author line.

## Verify (must pass)

```
cd app/backend/gateway && composer test
cd app/frontend && npm run typecheck && npm run build
```
