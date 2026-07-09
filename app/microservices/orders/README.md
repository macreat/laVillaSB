# orders

Order management microservice for the laVillaSB platform.

## Purpose

Own the shopping cart, checkout, and order lifecycle for customer purchases.

## Responsibilities

- Manage shopping carts and cart items.
- Create and persist orders.
- Orchestrate checkout with inventory reservations and payments.
- Track order status (pending, paid, shipped, delivered, cancelled).
- Emit order lifecycle events.

## Internal Structure

```
orders/
├── README.md                 # This file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/       # Cart, checkout, orders
│   │       └── schemas/      # Pydantic models
│   ├── core/
│   │   ├── config.py
│   │   └── events.py
│   ├── models/               # Cart, CartItem, Order, OrderItem, Shipment
│   ├── services/             # Checkout orchestration
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
- PostgreSQL (`orders_db`)
- Redis (cart cache)
- Inventory service (reservations)
- Payments service (payment processing)
- Notifications service (event-driven)

## Public Interfaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart` | GET/POST | Get / update cart |
| `/api/v1/cart/items` | POST | Add item to cart |
| `/api/v1/cart/items/{id}` | DELETE | Remove item |
| `/api/v1/checkout` | POST | Initiate checkout |
| `/api/v1/orders` | GET/POST | List / create orders |
| `/api/v1/orders/{id}` | GET | Order details |
| `/api/v1/orders/{id}/cancel` | POST | Cancel order |
| `/api/v1/orders/{id}/ship` | POST | Mark shipped (staff) |

## Inputs

- Gateway cart and checkout requests.
- Payment success/failure events.
- Inventory reservation confirmations.

## Outputs

- Order records.
- OrderCreated, OrderPaid, OrderShipped events.
- Notifications triggered to customers.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Cart cache |
| `INVENTORY_SERVICE_URL` | Inventory microservice |
| `PAYMENTS_SERVICE_URL` | Payments microservice |
| `BROKER_URL` | Event broker |
| `CART_TTL_HOURS` | Anonymous cart TTL |

## Future Extensions

- Order sagas for distributed transaction reliability.
- Subscription and recurring orders.
- Split shipments and drop-shipping support.
- Order analytics and reporting.
