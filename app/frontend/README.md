# frontend

Next.js storefront for the laVillaSB platform.

## Purpose

Deliver a fast, SEO-friendly, professional customer-facing web application for browsing skateboarding products, managing accounts, and placing orders.

## Responsibilities

- Render product catalog, product detail, cart, and checkout pages.
- Authenticate customers via the Laravel gateway.
- Consume REST API endpoints from the gateway.
- Handle client-side state (cart, user session, filters).
- Support SSR/SSG for performance and SEO.
- Provide responsive and accessible UI.

## Internal Structure

```
frontend/
├── README.md                 # This file
├── app/                      # Next.js App Router
│   ├── (shop)/               # Public storefront routes
│   ├── account/              # Customer account pages
│   ├── api/                  # Next.js API routes
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Primitive UI components
│   ├── product/              # Product-related components
│   └── checkout/             # Checkout components
├── lib/                      # Utilities, API clients
│   ├── api.ts                # Gateway API client
│   └── auth.ts               # Authentication helpers
├── public/                   # Static assets
├── styles/                   # Global styles / Tailwind config
├── tests/                    # Unit and E2E tests
└── .env.example              # Environment template
```

## Dependencies

- Node.js 20+
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS (recommended)
- React Query / SWR for server state
- Zustand / Redux Toolkit for client state
- Laravel gateway for API and auth

## Public Interfaces

| Route | Description |
|-------|-------------|
| `/` | Home / featured products |
| `/products` | Product listing |
| `/products/{slug}` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/account` | Customer account |
| `/orders` | Order history |

## Inputs

- Customer browser interactions.
- Gateway REST API responses.
- Webhooks via Next.js API routes.

## Outputs

- Server-rendered HTML pages.
- Client-side dynamic updates.
- Analytics and tracking events.

## Configuration

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Gateway public API URL |
| `NEXT_PUBLIC_SITE_URL` | Storefront public URL |
| `API_INTERNAL_URL` | Server-side gateway URL |

## Future Extensions

- Progressive Web App (PWA) support.
- Internationalization (i18n) for multi-region stores.
- Real-time inventory updates via WebSockets.
- AI-powered product recommendations.
