# Deploying La Villa SB - the ~$11/month plan

The storefront runs on Vercel, the thirteen containers run on one VPS, and a
single domain ties them together.

| Piece | Where | Cost |
| --- | --- | --- |
| Storefront (Next.js) | Vercel Hobby | $0 |
| API, microservices, Postgres, Redis, RabbitMQ, Meilisearch, MinIO | VPS, 2 vCPU / 4 GB | ~$10 |
| Domain | Registrar first-year promo | ~$1 |

Read [Before you commit to this shape](#before-you-commit-to-this-shape) first.
Vercel Hobby forbids commercial use, and this is a store.

## The short version

Three inputs are needed, and each is a purchase or a login that only the account
owner can make. Once you have them, each half is one command:

```bash
# 1. Buy a domain and point api/media/storefront at the VPS.
# 2. Buy the VPS, then:
VPS_HOST=<ip> ROOT_DOMAIN=<domain> ACME_EMAIL=<you> bash deploy/deploy-vps.sh
# 3. Then the storefront:
VERCEL_TOKEN=<token> ROOT_DOMAIN=<domain> bash deploy/deploy-vercel.sh
```

`deploy-vps.sh` clones `main` by default. Until the section/category/size work
is merged there, add `BRANCH=feat/catalog-taxonomy-and-deploy` - the script
checks and refuses rather than quietly shipping the older storefront.

`deploy-vps.sh` gates on DNS, provisions the host, generates every secret on
the server, starts the stack and waits for the API to answer over TLS.
`deploy-vercel.sh` sets all six production environment variables, builds,
promotes and attaches the domain. Both are idempotent.

Checked 2026-09-09 and free at the time: `lavillasb.com`,
`lavillaskateboarding.com`, `lavillasb.co`, `lavillasb.net`, `lavillasb.store`.

---

## How the pieces talk

```
        browser
           |
           | https://lavillasb.com
           v
   +----------------+        /api/v1/*, /api/admin/*        +-------------------+
   |     Vercel     | ----------------------------------->  |  Caddy (TLS)      |
   |  Next.js SSR   |        https://api.lavillasb.com      |  on the VPS       |
   |                |                                       +---------+---------+
   |  /api/media/*  | --------------------------------------> media.  |
   +----------------+        https://media.lavillasb.com             |
                                                            +---------v---------+
                                                            | gateway (Laravel) |
                                                            | catalog inventory |
                                                            | orders users ...  |
                                                            | postgres redis    |
                                                            | rabbitmq meili    |
                                                            | minio             |
                                                            +-------------------+
```

The browser only ever talks to two hosts: the Vercel storefront and, through
it, the VPS. Nothing on the VPS except Caddy is reachable from the internet -
Postgres, RabbitMQ, MinIO and every microservice stay on the internal Docker
network with no published port.

`GATEWAY_ORIGIN` is what makes the same codebase work in both places. Compose
leaves it unset and Next rewrites `/api/v1/*` to `http://gateway:8010` over the
Docker network; the Vercel build sets it to `https://api.<domain>`. It is read
at build time on purpose, because Next bakes rewrites into the routes manifest.

---

## 1. Buy the domain

Any registrar with a first-year promo works. Cloudflare Registrar sells at cost
with no markup and includes free DNS, which is the cheapest steady state after
the promo year ends - worth preferring over a $1 first year that renews at $20.

Create these DNS records once the VPS exists:

| Type | Name | Value |
| --- | --- | --- |
| A | `api` | VPS IPv4 |
| A | `media` | VPS IPv4 |
| A | `storefront` | VPS IPv4 |
| A / CNAME | `@` and `www` | whatever Vercel tells you when you add the domain |

The three VPS records must resolve **before** the first `docker compose up`, or
Caddy cannot complete the ACME challenge and will not get certificates.

## 2. Provision the VPS

Any 2 vCPU / 4 GB Ubuntu box: Hetzner CX22, DigitalOcean, Vultr, Linode.

The one-command path, which also does step 3 for you:

```bash
VPS_HOST=<vps-ip> ROOT_DOMAIN=<domain> ACME_EMAIL=<you@example.com> \
  bash deploy/deploy-vps.sh
```

It refuses to start until `api`, `media` and `storefront` resolve to the VPS,
because a failed ACME challenge is rate-limited by the CA.

To provision only, without deploying:

```bash
scp deploy/provision-vps.sh root@<vps-ip>:/tmp/
ssh root@<vps-ip> 'bash /tmp/provision-vps.sh'
```

Either way that installs Docker, adds 2 GB of swap, caps container log growth,
closes everything but SSH and 80/443, and turns on unattended security
updates.

## 3. Start the stack

`deploy-vps.sh` already did this. What follows is the manual equivalent, for
when you want to see each step or are recovering a half-finished deploy.

```bash
ssh lavilla@<vps-ip>
git clone <repo-url> /opt/lavillasb
cd /opt/lavillasb
cp deploy/env.prod.example .env
```

Fill every secret in `.env`:

```bash
openssl rand -base64 32     # once per password / master key
docker compose run --rm gateway php artisan key:generate --show   # APP_KEY
```

Then:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -fsS https://api.<domain>/api/v1/catalog/health
```

The production overlay publishes only Caddy's 80/443, swaps every development
default for a secret from `.env`, and puts a memory ceiling on each container.
Those ceilings deliberately add up to more than 4 GB: they are blast-radius
caps, not reservations. Idle draw across all thirteen is about 0.9 GB.

## 4. Deploy the storefront to Vercel

```bash
VERCEL_TOKEN=<token> ROOT_DOMAIN=<domain> bash deploy/deploy-vercel.sh
```

Get a token at <https://vercel.com/account/tokens>. Omit `VERCEL_TOKEN` to use
an existing `vercel login` session instead.

Vercel can also register the domain, which collapses two of the three purchases
into one account. It is opt-in because it spends money, and it charges registry
price rather than a promo - budget ~$20/yr for a `.com`, not $1:

```bash
BUY_DOMAIN=1 VERCEL_TOKEN=<token> ROOT_DOMAIN=<domain> bash deploy/deploy-vercel.sh
```

That script sets these for you. To do it by hand, they are the Production
scope variables the storefront needs:

| Variable | Value | Why |
| --- | --- | --- |
| `GATEWAY_ORIGIN` | `https://api.<domain>` | Build-time rewrite target |
| `MEDIA_ORIGIN_BASE_URL` | `https://media.<domain>` | Runtime media proxy upstream |
| `NEXT_PUBLIC_API_BASE_URL` | *(empty string)* | Keeps API calls same-origin |
| `NEXT_PUBLIC_SITE_URL` | `https://<domain>` | Canonical URLs |
| `NEXT_PUBLIC_WHATSAPP_URL` | the store's wa.me link | Contact affordances |
| `NEXT_PUBLIC_INSTAGRAM_URL` | the store's profile | Footer |

`GATEWAY_ORIGIN` must be set **before** the first production build. It is
inlined into the routes manifest, so changing it later needs a redeploy, not a
restart.

Then add `STOREFRONT_ORIGIN=https://<domain>` to the VPS `.env` and restart, so
Caddy sends the matching CORS header and Laravel Sanctum treats the storefront
as first-party:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d caddy gateway
```

## 5. Verify

```bash
curl -fsS https://api.<domain>/api/v1/catalog/health
curl -fsS "https://api.<domain>/api/v1/catalog/products" | head -c 200
CATALOG_SMOKE_URL=https://api.<domain>/api/v1/catalog/products \
STOREFRONT_SMOKE_URL="https://<domain>/products?section=ropa&category=busos&size=L" \
  node app/frontend/scripts/category-subtabs-smoke.mjs
```

The smoke script asserts every product routes into a section, the sizes are
populated, and the storefront serves a built page - it is the fastest proof the
two halves are actually talking.

---

## Before you commit to this shape

### Vercel Hobby forbids commercial use

This is the real problem, not a footnote. Vercel's Hobby plan is for
non-commercial personal projects. A storefront that takes orders, links to
WhatsApp checkout, and advertises free shipping over $250.000 COP is a
commercial site by any reading of that term.

What that means in practice:

- **Enforcement is by suspension, not a bill.** Vercel does not silently
  upgrade you. They notice - usually from traffic patterns or a report - email
  you, and can disable the deployment. The storefront goes dark until you move
  or upgrade to Pro at $20/month per member, which triples the plan's cost.
- **There is no appeal that keeps you on Hobby.** The remedy is always to
  upgrade or leave.
- **Recovery is not instant.** Repointing DNS to the VPS is a few minutes of
  work plus propagation, but only if you have already proved the VPS can serve
  the storefront. That is why `storefront.<domain>` exists in the Caddyfile and
  in this deployment: it is a tested escape hatch, not a plan you have to
  invent under pressure.

Other Hobby limits you will feel before the terms do:

- **No commercial support and no SLA.** An outage is resolved when it is
  resolved.
- **100 GB/month bandwidth and 100 GB-hours of function execution.** Product
  images go through `/api/media/*`, which is a Next route, so every image view
  burns both bandwidth *and* function time. A catalog of 1500 products with
  photos will move this faster than you expect. Serving images straight from
  `media.<domain>` instead of proxying them is the single biggest saving
  available.
- **Twelve-second function timeout**, versus sixty on Pro. The natural-language
  search calls an LLM; a slow upstream will cut off rather than degrade.
- **One concurrent build**, and deployment protection features are Pro-only.

**The honest recommendation:** run the storefront on the VPS behind Caddy from
day one and skip Vercel. The container is already built, `storefront.<domain>`
is already configured, and the box has room. That costs $11/month with no terms
problem, no Hobby limits, and one less moving part. Use Vercel when the traffic
justifies Pro, not to save $0 on a plan whose terms the site does not meet.

### The other things this plan gives up

- **Thirteen containers in 4 GB leaves little headroom.** Fine at idle (~0.9 GB
  measured), and the memory ceilings stop one service taking the box down. But
  a traffic spike during a Meilisearch reindex will page hard. The 2 GB of swap
  the provisioning script adds is what turns that from an outage into a slow
  minute.
- **A crash is recovered by hand.** `restart: unless-stopped` covers a process
  dying. It does not cover a full box, a bad deploy, or a disk filling up - for
  those, someone has to SSH in. There is no paid monitoring, so you find out
  when a customer tells you. A free uptime check on `api.<domain>/api/v1/
  catalog/health` closes most of that gap for $0.
- **No managed backups.** The Postgres volume and the MinIO bucket are the
  business; both live on one disk. Add the provider's block-storage snapshots
  (usually ~$1-2/month) or a nightly `pg_dump` to object storage before you
  take a real order. This is the cheapest insurance on the list and the only
  omission that can lose data rather than uptime.
- **Single region, single machine.** Any maintenance is downtime.

---

## Operations

```bash
# Where everything is, and what it is using
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker stats --no-stream

# Logs for one service
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f catalog

# Ship a new version
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Back up the database
docker compose exec -T postgres pg_dump -U lavilla lavilla | gzip > "lavilla-$(date +%F).sql.gz"
```

### Falling back off Vercel

If the Hobby terms become a problem, point the apex DNS at the VPS instead of
Vercel and the `storefront.<domain>` block in the Caddyfile serves the same
container that is already running. Verify it first, while nothing is on fire:

```bash
curl -fsS https://storefront.<domain>/products | head -c 200
```
