<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles: N/A (initial adoption)
- Added sections: None (template populated)
- Removed sections: None
- Templates requiring updates: .specify/templates/plan-template.md (updated), .specify/templates/spec-template.md (updated), .specify/templates/tasks-template.md (updated), .specify/templates/commands/*.md (⚠ missing)
- Follow-up TODOs: TODO(RATIFICATION_DATE): original adoption date not provided
-->

# Plotter Constitution

## Core Principles

### I. Stack Guardrails (NON-NEGOTIABLE)

The backend MUST remain a Node.js + TypeScript Express server in the express/ directory
with MongoDB as the only database. The frontend MUST remain a React app in web/ using
TanStack Router, Flowbite React where reasonable, Tailwind CSS for base styles, and
unplugin-icons with Material UI icon packs as needed. Do not introduce other frameworks.

### II. Clean Architecture Boundaries

All features MUST adhere to Clean Architecture separation across Domain, Application,
and Infrastructure layers. Business rules live in services; API routing is orchestration
only. Any cross-layer dependency MUST be explicit and justified.

### III. Routing, Services, and Data Access Discipline

Routes MUST be defined via Express routers. Services MUST compose actions and hold
workflow logic. All MongoDB queries MUST live in models/ and be exported as consistent,
clean functions. No MongoDB queries outside models/.

### IV. Security-First Input and Error Handling

Every user input MUST be validated and sanitized. Error handling MUST use an elegant
try/catch flow with a global middleware fallback. Development mode MUST surface root
causes; production MUST obfuscate sensitive database or system errors.

### V. Performance and Environment Awareness

API response times MUST remain under 200ms for normal load. Frontend routing and XHR
clients MUST support distinct base URLs for localhost + Vite, localhost + server build,
and production domain deployments.

## Architecture & Code Structure

- APIs MUST be RESTful and use JSON for requests and responses.
- Service Locator is prohibited; use constructor-based dependency injection.
- Database manipulation must be grouped in models/ with no direct queries elsewhere.
- Services must compose utils and data methods for workflows; routers remain thin.

## Quality, Documentation & Workflow

- No automated testing is required for now unless explicitly requested.
- All generated commit messages MUST follow Conventional Commits format.
- Before writing code, ask clarifying questions for any spec ambiguity.
- spec.md must remain technology-agnostic; technical details belong in plan.md.

## Governance

- This constitution supersedes other guidance; deviations require explicit approval and
  documented justification in the plan.
- All plans and tasks must include a Constitution Check against the Core Principles.
- Amendments require documentation, consensus of maintainers, and a semantic version bump.
- Compliance is reviewed during PRs and release readiness checks.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not provided | **Last Amended**: 2026-03-21
