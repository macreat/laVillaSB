# users

User identity and profile microservice for the laVillaSB platform.

## Purpose

Manage user accounts, authentication, authorization, and profile data across the platform.

## Responsibilities

- Register and authenticate customers, staff, and admins.
- Issue and validate JWT/OAuth2 tokens.
- Store and manage user profiles, roles, and permissions.
- Handle password resets, email verification, and MFA.
- Emit identity events (UserRegistered, PasswordChanged, etc.).

## Internal Structure

```
users/
├── README.md                 # This file
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/       # Auth, profile, user admin
│   │       ├── schemas/      # Pydantic request/response models
│   │       └── deps.py       # Auth dependencies
│   ├── core/
│   │   ├── config.py         # Settings
│   │   ├── security.py       # Hashing, JWT
│   │   └── events.py         # Domain event definitions
│   ├── models/               # SQLModel entities
│   ├── services/             # Business logic
│   └── repositories/         # Data access layer
├── alembic/                  # Database migrations
├── tests/                    # Unit and integration tests
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Dependencies

- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL (`users_db`)
- Redis (token blocklist, sessions)
- passlib + bcrypt (password hashing)
- python-jose (JWT)

## Public Interfaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Create account |
| `/api/v1/auth/login` | POST | Authenticate |
| `/api/v1/auth/logout` | POST | Invalidate tokens |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/users/me` | GET/PUT | Current profile |
| `/api/v1/users/{id}` | GET | User details (admin) |
| `/api/v1/users/{id}/roles` | PUT | Update roles (admin) |

## Inputs

- HTTP requests from the gateway.
- Email verification callbacks.
- MFA token submissions.

## Outputs

- JSON auth responses (tokens, user data).
- Domain events to the message broker.
- Audit records in PostgreSQL.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `REDIS_URL` | Redis connection |
| `SECRET_KEY` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL |
| `ALGORITHM` | JWT algorithm (HS256/RS256) |

## Future Extensions

- Social login providers (Google, Apple).
- Organization/tenant support.
- Biometric authentication flows.
- Self-service account deletion and data export.
