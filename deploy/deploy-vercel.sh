#!/usr/bin/env bash
#
# Deploy the storefront to Vercel, non-interactively, in one shot.
#
#   VERCEL_TOKEN=... ROOT_DOMAIN=lavillasb.com bash deploy/deploy-vercel.sh
#
# Get a token at https://vercel.com/account/tokens, or run `vercel login` first
# and omit VERCEL_TOKEN - the CLI's stored session is used instead.
#
# It links the project, sets every production environment variable the
# storefront needs, builds, promotes to production, and attaches the domain.
# Re-running is safe: env vars are replaced rather than duplicated.

set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../app/frontend" && pwd)"
ROOT_DOMAIN="${ROOT_DOMAIN:?set ROOT_DOMAIN, e.g. ROOT_DOMAIN=lavillasb.com}"
PROJECT_NAME="${PROJECT_NAME:-lavillasb}"

STOREFRONT_ORIGIN="https://${ROOT_DOMAIN}"
GATEWAY_ORIGIN="${GATEWAY_ORIGIN:-https://api.${ROOT_DOMAIN}}"
MEDIA_ORIGIN_BASE_URL="${MEDIA_ORIGIN_BASE_URL:-https://media.${ROOT_DOMAIN}}"
WHATSAPP_URL="${NEXT_PUBLIC_WHATSAPP_URL:-https://api.whatsapp.com/send/?phone=573017602493}"
INSTAGRAM_URL="${NEXT_PUBLIC_INSTAGRAM_URL:-https://www.instagram.com/la_villa_sb/}"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }

command -v vercel >/dev/null || { echo "vercel CLI not installed: npm i -g vercel" >&2; exit 1; }

VC=(vercel)
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VC+=(--token "$VERCEL_TOKEN")
fi

cd "$FRONTEND_DIR"

log "Checking authentication"
"${VC[@]}" whoami

log "Linking the project"
"${VC[@]}" link --yes --project "$PROJECT_NAME"

log "Setting production environment"
# GATEWAY_ORIGIN must exist before the build: Next bakes rewrites into the
# routes manifest, so a value added afterwards needs a redeploy, not a restart.
set_env() {
  local name="$1" value="$2"
  # Remove first so a re-run replaces rather than erroring on a duplicate.
  "${VC[@]}" env rm "$name" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | "${VC[@]}" env add "$name" production >/dev/null
  echo "  set $name"
}

set_env GATEWAY_ORIGIN "$GATEWAY_ORIGIN"
set_env MEDIA_ORIGIN_BASE_URL "$MEDIA_ORIGIN_BASE_URL"
set_env NEXT_PUBLIC_API_BASE_URL ""
set_env NEXT_PUBLIC_SITE_URL "$STOREFRONT_ORIGIN"
set_env NEXT_PUBLIC_WHATSAPP_URL "$WHATSAPP_URL"
set_env NEXT_PUBLIC_INSTAGRAM_URL "$INSTAGRAM_URL"

log "Building and promoting to production"
"${VC[@]}" deploy --prod --yes

log "Attaching ${ROOT_DOMAIN}"
"${VC[@]}" domains add "$ROOT_DOMAIN" --yes 2>&1 || \
  echo "  (already attached, or finish the DNS step Vercel just printed)"

cat <<EOF

Storefront deployed.

Remaining, on the VPS, so the API accepts calls from this origin:
  echo 'STOREFRONT_ORIGIN=${STOREFRONT_ORIGIN}' >> /opt/lavillasb/.env
  echo 'STOREFRONT_DOMAIN=${ROOT_DOMAIN}'       >> /opt/lavillasb/.env
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d caddy gateway

Then verify both halves are talking:
  CATALOG_SMOKE_URL=${GATEWAY_ORIGIN}/api/v1/catalog/products \\
  STOREFRONT_SMOKE_URL="${STOREFRONT_ORIGIN}/products?section=ropa&category=busos&size=L" \\
    node app/frontend/scripts/category-subtabs-smoke.mjs
EOF
