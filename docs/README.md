# docs

Central documentation hub for the laVillaSB platform.

## Purpose

Capture architecture decisions, operational runbooks, API contracts, and onboarding guides outside of source code. This directory is the single source of truth for "why" and "how" the system is built.

## Responsibilities

- Maintain architecture decision records (ADRs).
- Publish API usage guides and OpenAPI references.
- Document deployment, monitoring, and incident procedures.
- Provide onboarding material for new developers.
- Track diagrams, data models, and sequence flows.

## Internal Structure

```
docs/
├── README.md                 # This file
├── adr/                      # Architecture Decision Records
├── api/                      # API guides and examples
├── architecture/             # C4 models, diagrams, data flows
├── operations/               # Runbooks, deployment, incident response
└── onboarding/               # New developer guides
```

## Dependencies

- Markdown renderer (GitHub, MkDocs, or Docusaurus).
- Diagrams-as-code tools: Mermaid, PlantUML, or Structurizr.
- OpenAPI viewer for API guides.

## Public Interfaces

- Human-readable Markdown files committed to version control.
- Rendered documentation site (optional future publication).

## Inputs

- Architectural decisions made by the team.
- Code changes requiring documentation updates.
- Operational incidents and postmortems.

## Outputs

- ADRs, runbooks, API guides, diagrams.
- Onboarding checklists and contribution guidelines.

## Configuration

- `mkdocs.yml` or `docusaurus.config.js` if a docs site is generated.
- No runtime configuration.

## Future Extensions

- Publish docs as a static site via CI/CD.
- Add automated OpenAPI diff reports.
- Include interactive API explorer.
