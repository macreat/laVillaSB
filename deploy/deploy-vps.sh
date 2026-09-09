#!/usr/bin/env bash
#
# Provision a fresh VPS and bring the whole stack up on it, in one shot.
#
#   VPS_HOST=203.0.113.10 ROOT_DOMAIN=lavillasb.com ACME_EMAIL=you@example.com \
#     bash deploy/deploy-vps.sh
#
# Run it from a checkout on your machine, against a bare Ubuntu 22.04/24.04 box
# you can already SSH into as root. It provisions the host, generates every
# secret, uploads them, clones the repo and starts the production stack.
#
# Re-running is safe: provisioning is idempotent, and an existing .env on the
# host is kept rather than regenerated, so secrets stay stable across deploys.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

VPS_HOST="${VPS_HOST:?set VPS_HOST to the server IP or hostname}"
VPS_USER="${VPS_USER:-root}"
ROOT_DOMAIN="${ROOT_DOMAIN:?set ROOT_DOMAIN, e.g. ROOT_DOMAIN=lavillasb.com}"
ACME_EMAIL="${ACME_EMAIL:?set ACME_EMAIL, the address for certificate expiry notices}"
REPO_URL="${REPO_URL:-git@github.com:macreat/laVillaSB.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/lavillasb}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@${ROOT_DOMAIN}}"

SSH=(ssh -o StrictHostKeyChecking=accept-new "${VPS_USER}@${VPS_HOST}")

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }

# Resolve an A record without depending on dig, which is not installed by
# default on a minimal Ubuntu or on WSL. getent uses the system resolver;
# python3 is the fallback when nss is configured oddly.
resolve_a() {
  local host="$1"
  getent ahostsv4 "$host" 2>/dev/null | awk '/STREAM|RAW/ {print $1; exit}' && return 0
  python3 - "$host" 2>/dev/null <<'PY'
import socket, sys
try:
    print(socket.gethostbyname(sys.argv[1]))
except OSError:
    pass
PY
}

log "Checking DNS"
# Caddy cannot complete the ACME challenge if these do not already resolve
# here, and a failed challenge is rate-limited by the CA - so this is a hard
# gate rather than a warning.
missing=()
for sub in api media storefront; do
  got="$(resolve_a "${sub}.${ROOT_DOMAIN}" | head -1)"
  if [[ "$got" != "$VPS_HOST" ]]; then
    missing+=("${sub}.${ROOT_DOMAIN} -> ${got:-<unset>}")
  fi
done
if (( ${#missing[@]} )); then
  printf 'These A records must point at %s before deploying:\n' "$VPS_HOST" >&2
  printf '  %s\n' "${missing[@]}" >&2
  echo "Set them at your registrar, wait for propagation, then re-run." >&2
  exit 1
fi
echo "  api, media and storefront all resolve to ${VPS_HOST}"

log "Provisioning the host"
scp -o StrictHostKeyChecking=accept-new \
  "$REPO_ROOT/deploy/provision-vps.sh" "${VPS_USER}@${VPS_HOST}:/tmp/"
"${SSH[@]}" 'bash /tmp/provision-vps.sh'

log "Cloning the repository"
"${SSH[@]}" "test -d ${APP_DIR}/.git \
  || git clone --branch ${BRANCH} ${REPO_URL} ${APP_DIR}"
"${SSH[@]}" "cd ${APP_DIR} && git fetch --quiet origin && git checkout --quiet ${BRANCH} && git pull --quiet"

log "Checking the branch actually carries the current storefront"
# Deploying a branch that predates the section/category/size taxonomy silently
# ships the old two-level storefront - the containers come up healthy and the
# mistake only surfaces when someone browses the site. Fail loudly instead.
if ! "${SSH[@]}" "test -f ${APP_DIR}/app/microservices/catalog/src/taxonomy.py"; then
  cat >&2 <<EOF
Branch '${BRANCH}' does not contain the catalog taxonomy, so this would deploy
the storefront as it was before the section/category/size work.

Either merge that work into '${BRANCH}', or deploy the branch that has it:

  BRANCH=feat/catalog-taxonomy-and-deploy VPS_HOST=${VPS_HOST} \\
    ROOT_DOMAIN=${ROOT_DOMAIN} ACME_EMAIL=${ACME_EMAIL} bash deploy/deploy-vps.sh
EOF
  exit 1
fi

log "Generating secrets"
if "${SSH[@]}" "test -f ${APP_DIR}/.env"; then
  echo "  .env already exists on the host, keeping it"
else
  # The non-secret half is templated here; the secrets are generated on the
  # server by the block below, so they never touch this machine's disk or
  # shell history.
  "${SSH[@]}" "cat > ${APP_DIR}/.env" <<ENVFILE
ROOT_DOMAIN=${ROOT_DOMAIN}
ACME_EMAIL=${ACME_EMAIL}
STOREFRONT_ORIGIN=https://${ROOT_DOMAIN}
STOREFRONT_DOMAIN=${ROOT_DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ENVFILE

  # Piped to `bash -s` with a quoted heredoc: the remote script is sent
  # verbatim, so nothing here needs escaping and $APP_DIR is passed as an
  # argument rather than interpolated into a quoted command string.
  "${SSH[@]}" bash -s -- "$APP_DIR" <<'REMOTE'
set -euo pipefail
cd "$1"
# Trim base64's '=' '+' '/' so every secret is safe unquoted in an env file.
for key in DB_PASSWORD RABBITMQ_DEFAULT_PASS MEILI_MASTER_KEY \
           S3_SECRET_ACCESS_KEY ADMIN_PASSWORD; do
  printf '%s=%s\n' "$key" "$(openssl rand -base64 48 | tr -d '=+/' | cut -c1-32)" >> .env
done
printf 'S3_ACCESS_KEY_ID=lavilla%s\n' "$(openssl rand -hex 4)" >> .env
chmod 600 .env
REMOTE
  echo "  generated; read them back with: ssh ${VPS_USER}@${VPS_HOST} 'cat ${APP_DIR}/.env'"
fi

log "Generating the Laravel application key"
"${SSH[@]}" bash -s -- "$APP_DIR" <<'REMOTE'
set -euo pipefail
cd "$1"
grep -q '^APP_KEY=base64:' .env && exit 0
sed -i '/^APP_KEY=/d' .env
printf 'APP_KEY=base64:%s\n' "$(openssl rand -base64 32)" >> .env
REMOTE

log "Starting the stack (first build takes a few minutes)"
"${SSH[@]}" "cd ${APP_DIR} && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"

log "Waiting for the API to answer over TLS"
for attempt in $(seq 1 30); do
  if curl -fsS --max-time 5 "https://api.${ROOT_DOMAIN}/api/v1/catalog/health" >/dev/null 2>&1; then
    echo "  healthy after ${attempt} attempt(s)"
    break
  fi
  if (( attempt == 30 )); then
    echo "  API did not come up. Check certificates and logs:" >&2
    echo "    ssh ${VPS_USER}@${VPS_HOST} 'cd ${APP_DIR} && docker compose -f docker-compose.yml -f docker-compose.prod.yml logs caddy gateway'" >&2
    exit 1
  fi
  sleep 10
done

log "Status"
"${SSH[@]}" "cd ${APP_DIR} && docker compose -f docker-compose.yml -f docker-compose.prod.yml ps"
curl -fsS "https://api.${ROOT_DOMAIN}/api/v1/catalog/health"; echo

cat <<EOF

Stack is up.

  API        https://api.${ROOT_DOMAIN}
  Media      https://media.${ROOT_DOMAIN}
  Storefront https://storefront.${ROOT_DOMAIN}   (the VPS-served fallback)

The admin password was generated on the host. Read it, then change it after
first login:
  ssh ${VPS_USER}@${VPS_HOST} 'grep ADMIN_ ${APP_DIR}/.env'

Next: deploy the storefront to Vercel, or point the apex DNS at this box and
use the storefront URL above instead.
  VERCEL_TOKEN=... ROOT_DOMAIN=${ROOT_DOMAIN} bash deploy/deploy-vercel.sh
EOF
