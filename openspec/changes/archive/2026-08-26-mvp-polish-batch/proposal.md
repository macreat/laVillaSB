# Proposal: MVP Polish Batch — Five Changes

## Intent

The store MVP has five unresolved issues blocking launch readiness: WhatsApp catalog auto-send is incomplete, the admin dashboard shows services as unreachable, the cookies banner renders full-screen instead of a small overlay, the footer lacks developer attribution, and the hero image is oversized. This batch addresses all five to reach a shippable state.

## Scope

### In Scope

1. **WhatsApp Catalog Auto-Send**: Notifications service (port 9006) auto-sends product catalog to "+57 324 571 0972" via WhatsApp Cloud API. Includes order tracking by sender.
2. **Admin Dashboard Health Checks**: Fix gateway proxy so inventory and catalog health endpoints return 200 for the admin dashboard, changing status from "Unreachable" to "Healthy".
3. **Cookies Banner Redesign**: Replace full-screen overlay with a small centered card showing logoOG, "Performance, Created, Designed by Macreat", and macreat.jpeg signature.
4. **Footer Developer Attribution**: Add Macreat logo next to "Company" column labeled "Developer".
5. **Hero Image Resize**: Resize `lavillasb.png` (currently 1200x1200) to fit the hero section properly.

### Out of Scope

- WhatsApp template message approval process (Meta business verification)
- Full order management UI (deferred to orders service)
- Additional notification channels (email, SMS)
- Image optimization pipeline beyond manual resize

## Capabilities

### New Capabilities
- `whatsapp-catalog-auto-send`: Automated WhatsApp catalog delivery with sender tracking
- `admin-service-health-monitoring`: Public health check proxy for dashboard service status

### Modified Capabilities
- `storefront-visual-polish`: Cookies banner and footer layout changes (pure UI, no spec-level behavior change)

## Approach

1. **WhatsApp**: Extend `notifications/src/main.py` with a scheduled endpoint or cron trigger. Use WhatsApp Cloud API text messages (existing `whatsapp.py`). Add `sender_ip` or `sender_id` tracking to the `/send-catalog` endpoint.
2. **Health Checks**: The gateway route `GET /v1/{service}/health` at line 21 of `routes/api.php` exists but may be shadowed by the auth-guarded wildcard at line 24. Fix by ensuring the public health route is evaluated first (Laravel route priority) or by adding explicit health routes for inventory. Verify `SERVICE_INVENTORY_URL` env var is set in docker-compose.
3. **Cookies Banner**: Update `CookiesConsent.tsx` — remove full-screen positioning, add logoOG image, add macreat.jpeg signature image, keep small centered card layout.
4. **Footer**: Add a "Developer" section to `StoreFooter.tsx` next to "Company" with macreat.jpeg image.
5. **Hero Image**: Use ImageMagick or sharp to resize `public/brand/lavillasb.png` from 1200x1200 to appropriate hero dimensions (e.g., 800x800 or aspect-fitted). Update `brand-manifest.json` dimensions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/microservices/notifications/src/main.py` | Modified | Add sender tracking, auto-send trigger |
| `app/microservices/notifications/src/config.py` | Modified | Add scheduling config |
| `app/backend/gateway/routes/api.php` | Modified | Fix health check route priority |
| `app/frontend/src/components/store/CookiesConsent.tsx` | Modified | Redesign to small centered card |
| `app/frontend/src/components/store/StoreFooter.tsx` | Modified | Add Developer column |
| `app/frontend/public/brand/lavillasb.png` | Modified | Resize image |
| `app/frontend/src/lib/brand-manifest.json` | Modified | Update lavillaSb dimensions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| WhatsApp API token expires or is not configured | Medium | Service returns mock success when unconfigured (existing behavior) |
| Laravel route ordering causes health checks to hit auth middleware | Medium | Test route resolution; add explicit named routes if needed |
| Resized image loses quality | Low | Use high-quality resize; keep original as backup |
| Cookies banner z-index conflicts with other overlays | Low | Use z-50 (existing), test with all page states |

## Rollback Plan

- **WhatsApp**: Remove the auto-send endpoint or disable via env var `WHATSAPP_AUTO_SEND=false`
- **Health Checks**: Revert `routes/api.php` to previous version
- **Cookies Banner**: Git revert the component change
- **Footer**: Git revert the component change
- **Image**: Restore original from git history

## Dependencies

- WhatsApp Cloud API token and phone number ID must be configured in `.env` for WhatsApp to work (currently returns mock success without them)
- `macreat.jpeg` must exist at `reference/docs/imgs/designLet/macreat.jpeg` (referenced but not verified in public/brand/)

## Success Criteria

- [ ] WhatsApp catalog send endpoint returns success with recipient confirmation
- [ ] Admin dashboard shows all three services as "Online" (green)
- [ ] Cookies banner appears as small centered card, not full-screen
- [ ] Footer displays Macreat developer attribution next to Company
- [ ] Hero image fits within its container without overflow
- [ ] All existing tests pass
- [ ] Build succeeds with no type errors

## Proposal Question Round

Before finalizing, these questions clarify business rules:

1. **WhatsApp auto-send trigger**: Should the catalog auto-send on a schedule (e.g., daily), on new product additions, or only when manually triggered via API?
2. **Order tracking scope**: "Track who sends orders" — should this log the WhatsApp recipient's phone number, or also capture metadata like timestamp and product list per send?
3. **Cookies banner behavior**: Should clicking "Accept" dismiss permanently (current behavior via localStorage), or should there be a "Manage" option?
4. **Footer layout**: Should "Developer" appear as a fourth column, or as a sub-section under the existing brand area?
5. **Image resize dimensions**: What is the target display size for `lavillasb.png` in the hero section? Current container is `aspect-square` in a grid cell.
