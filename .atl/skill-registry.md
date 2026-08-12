# Skill Registry

This file indexes instruction skills available to agents working in laVillaSB.
The referenced `SKILL.md` files are the source of truth and must be read before using a skill.

## Project conventions

| File | Scope | Purpose |
|------|-------|---------|
| `/home/lnxmacreat/AGENTS.md` | workspace | Shared engineering and artifact rules |
| `/home/lnxmacreat/.config/opencode/AGENTS.md` | workspace | Agent behavior, SDD, and Engram protocol |

## User-level skills

| Skill | Trigger | Path | Scope |
|-------|---------|------|-------|
| algorithmic-art | Creating algorithmic or generative art with code | `/home/lnxmacreat/.agents/skills/skills/algorithmic-art/SKILL.md` | user |
| branch-pr | Creating, opening, or preparing pull requests | `/home/lnxmacreat/.config/opencode/skills/branch-pr/SKILL.md` | user |
| brand-guidelines | Applying Anthropic brand colors, typography, or visual standards | `/home/lnxmacreat/.agents/skills/skills/brand-guidelines/SKILL.md` | user |
| canvas-design | Creating posters, static visual art, PNG, or PDF designs | `/home/lnxmacreat/.agents/skills/skills/canvas-design/SKILL.md` | user |
| chained-pr | Splitting changes above 400 lines or creating stacked PRs | `/home/lnxmacreat/.config/opencode/skills/chained-pr/SKILL.md` | user |
| cognitive-doc-design | Writing guides, READMEs, RFCs, onboarding, or architecture documentation | `/home/lnxmacreat/.config/opencode/skills/cognitive-doc-design/SKILL.md` | user |
| claude-api | Working with Claude, Anthropic APIs, or provider-unstated LLM tasks | `/home/lnxmacreat/.agents/skills/skills/claude-api/SKILL.md` | user |
| comment-writer | Writing PR, issue, review, Slack, or GitHub collaboration comments | `/home/lnxmacreat/.config/opencode/skills/comment-writer/SKILL.md` | user |
| doc-coauthoring | Co-authoring documentation, proposals, specs, or decision documents | `/home/lnxmacreat/.agents/skills/skills/doc-coauthoring/SKILL.md` | user |
| docx | Creating, reading, or editing Word documents | `/home/lnxmacreat/.agents/skills/skills/docx/SKILL.md` | user |
| frontend-design | Building or reshaping distinctive frontend user interfaces | `/home/lnxmacreat/.agents/skills/skills/frontend-design/SKILL.md` | user |
| go-testing | Writing or running Go tests, coverage, Bubbletea tests, or golden files | `/home/lnxmacreat/.config/opencode/skills/go-testing/SKILL.md` | user |
| internal-comms | Writing internal status reports, updates, incident reports, or FAQs | `/home/lnxmacreat/.agents/skills/skills/internal-comms/SKILL.md` | user |
| issue-creation | Creating GitHub issues, bug reports, or feature requests | `/home/lnxmacreat/.config/opencode/skills/issue-creation/SKILL.md` | user |
| judgment-day | Running explicit adversarial dual review | `/home/lnxmacreat/.config/opencode/skills/judgment-day/SKILL.md` | user |
| mcp-builder | Building MCP servers for external service integrations | `/home/lnxmacreat/.agents/skills/skills/mcp-builder/SKILL.md` | user |
| ml-notebook-audit-and-repair | Auditing or repairing machine-learning notebooks | `/home/lnxmacreat/.agents/skills/skills/ml-notebook-audit-skill/SKILL.md` | user |
| open-agent-teams | Delegating work to CLI agents in detached tmux sessions | `/home/lnxmacreat/.agents/skills/skills/open-agent-teams/SKILL.md` | user |
| pdf | Reading, creating, editing, or manipulating PDF files | `/home/lnxmacreat/.agents/skills/skills/pdf/SKILL.md` | user |
| platform-api-designer | Designing or reviewing APIs, backend services, or scalable platforms | `/home/lnxmacreat/.agents/skills/skills/swDesigner/SKILL.md` | user |
| pptx | Creating, reading, or editing slide presentations | `/home/lnxmacreat/.agents/skills/skills/pptx/SKILL.md` | user |
| repo-scaffolder | Bootstrapping or structuring a new repository | `/home/lnxmacreat/.agents/skills/skills/repo-scaffolder/SKILL.md` | user |
| repository-architecture | Creating or documenting repository structures and README files | `/home/lnxmacreat/.agents/skills/skills/repositoryArch/SKILL.md` | user |
| skill-creator | Creating, modifying, or evaluating agent skills | `/home/lnxmacreat/.agents/skills/skills/skill-creator/SKILL.md` | user |
| skill-improver | Auditing or improving existing skills | `/home/lnxmacreat/.config/opencode/skills/skill-improver/SKILL.md` | user |
| slack-gif-creator | Creating animated GIFs optimized for Slack | `/home/lnxmacreat/.agents/skills/skills/slack-gif-creator/SKILL.md` | user |
| sw-developer | Implementing, building, deploying, or maintaining application code | `/home/lnxmacreat/.agents/skills/skills/swDeveloper/SKILL.md` | user |
| theme-factory | Applying or creating themes for visual artifacts and HTML pages | `/home/lnxmacreat/.agents/skills/skills/theme-factory/SKILL.md` | user |
| token-optimization | Reducing LLM API costs, prompt size, or retrieval overhead | `/home/lnxmacreat/.agents/skills/skills/token-optimization/SKILL.md` | user |
| web-artifacts-builder | Building complex multi-component HTML/React web artifacts | `/home/lnxmacreat/.agents/skills/skills/web-artifacts-builder/SKILL.md` | user |
| webapp-testing | Testing local web applications with Playwright | `/home/lnxmacreat/.agents/skills/skills/webapp-testing/SKILL.md` | user |
| work-unit-commits | Planning reviewable implementation commits and work units | `/home/lnxmacreat/.config/opencode/skills/work-unit-commits/SKILL.md` | user |
| xlsx | Creating, reading, editing, or fixing spreadsheets | `/home/lnxmacreat/.agents/skills/skills/xlsx/SKILL.md` | user |

## Registry rules

- SDD phase skills, `_shared`, and `skill-registry` are intentionally excluded from this index.
- Duplicate skills are deduplicated in favor of the canonical OpenCode or `.agents` path.
- This registry is an index only; agents must read the complete referenced skill before execution.
