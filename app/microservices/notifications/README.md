# notifications

Notification delivery microservice for the laVillaSB platform.

## Purpose

Deliver transactional and marketing notifications across email, SMS, and push channels.

## Responsibilities

- Manage notification templates.
- Queue and send emails, SMS, and push messages.
- Track delivery status and customer preferences.
- Subscribe to domain events and trigger relevant notifications.
- Provide unsubscribe and preference management.

## Internal Structure

```
notifications/
├── README.md                 # This file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/       # Templates, preferences, send history
│   │       └── schemas/      # Pydantic models
│   ├── core/
│   │   ├── config.py
│   │   └── events.py
│   ├── models/               # Template, Notification, Preference
│   ├── services/             # Channel senders (email, sms, push)
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
- PostgreSQL (`notifications_db`)
- Email provider (SendGrid, AWS SES, Mailgun)
- SMS provider (Twilio)
- Push provider (Firebase Cloud Messaging)
- Message broker for event subscription

## Public Interfaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/notifications` | POST | Send notification |
| `/api/v1/notifications/{id}` | GET | Notification status |
| `/api/v1/templates` | GET/POST | Manage templates |
| `/api/v1/users/{id}/preferences` | GET/PUT | User preferences |
| `/api/v1/webhooks/{provider}` | POST | Provider delivery webhooks |

## Inputs

- Domain events from orders, payments, users services.
- Direct gateway requests for admin notifications.
- Webhook callbacks from email/SMS providers.

## Outputs

- Sent notifications.
- Delivery status updates.
- Bounce/complaint events.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `BROKER_URL` | Event broker |
| `SENDGRID_API_KEY` / `SES_*` | Email provider |
| `TWILIO_*` | SMS provider |
| `FIREBASE_CREDENTIALS` | Push provider |

## Future Extensions

- In-app notification center.
- A/B testing for email templates.
- Notification analytics and engagement dashboards.
- Multi-language template support.
