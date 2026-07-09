# tools

Developer tooling, automation scripts, and shared utilities for the laVillaSB project.

## Purpose

Keep one-off scripts, local development helpers, CI glue, and code-generation templates out of application source trees.

## Responsibilities

- Local environment bootstrapping.
- Linting, formatting, and pre-commit helpers.
- CI/CD pipeline scripts and artifact builders.
- Code generators (OpenAPI clients, DTO stubs, migration helpers).
- Database seed and fixture utilities.

## Internal Structure

```
tools/
├── README.md                 # This file
├── docker/                   # Docker Compose files and image configs
├── scripts/                  # Shell/PowerShell development scripts
├── generators/               # Code generation templates
├── ci/                       # CI/CD pipeline definitions and helpers
└── seeds/                    # Shared fixtures and seed data
```

## Dependencies

- Docker / Docker Compose
- Bash or PowerShell
- Python 3.12+ (for generators)
- GitHub Actions or equivalent CI runner

## Public Interfaces

- Executable scripts invoked from the repository root.
- Docker Compose profiles for local services.

## Inputs

- Developer commands.
- CI pipeline events.
- Source code and configuration files.

## Outputs

- Running local stacks.
- Generated code artifacts.
- Lint/test/build reports.

## Configuration

- `tools/docker/.env` for local service ports and credentials.
- Script-specific CLI arguments and environment variables.

## Future Extensions

- Terraform modules for cloud provisioning.
- Kubernetes manifests and Helm charts.
- Automated changelog and release scripts.
