# payments

Payment processing microservice for the laVillaSB platform.

## Purpose

Handle payment intents, captures, refunds, and payment method storage securely.

## Responsibilities

- Create and confirm payment intents.
- Capture funds when orders are ready.
- Process refunds and partial refunds.
- Store payment method references (tokenized, never raw card data).
- Reconcile transactions with payment providers.
- Emit payment events.

## Internal Structure

```
payments/
├── README.md                 # This file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/       # Intents, methods, refunds
│   │       └── schemas/      # Pydantic models
│   ├── core/
│   │   ├── config.py
│   │   └── events.py
│   ├── models/               # PaymentIntent, Transaction, Refund, PaymentMethod
│   ├── services/             # Provider adapters
│   └── repositories/         # Data access
├── alembic/
├── tests/
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Dependencies

- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL (`payments_db`)
- Payment provider SDKs (Stripe, PayPal, etc.)
- Redis (idempotency keys)
- Message broker for events

## Public Interfaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payment-intents` | POST | Create payment intent |
| `/api/v1/payment-intents/{id}/confirm` | POST | Confirm intent |
| `/api/v1/payment-intents/{id}/capture` | POST | Capture funds |
| `/api/v1/refunds` | POST | Process refund |
| `/api/v1/payment-methods` | GET/POST | Customer payment methods |
| `/api/v1/webhooks/{provider}` | POST | Provider webhooks |

## Inputs

- Gateway checkout requests.
- Webhooks from Stripe, PayPal, etc.
- Order events requiring capture/refund.

## Outputs

- Payment intent results.
- PaymentSucceeded, PaymentFailed, RefundProcessed events.
- Webhook acknowledgment responses.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Idempotency cache |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | PayPal credentials |
| `BROKER_URL` | Event broker |

## Future Extensions

- Support buy-now-pay-later providers.
- Cryptocurrency payment adapters.
- Fraud detection integration.
- PCI-DSS compliance tooling and audits.
