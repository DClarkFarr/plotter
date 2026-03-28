# Implementation Plan: Query Documentation Refresh

**Branch**: `012-update-query-structure` | **Date**: March 28, 2026 | **Spec**: [specs/012-update-query-structure/spec.md](specs/012-update-query-structure/spec.md)
**Input**: Feature specification from [specs/012-update-query-structure/spec.md](specs/012-update-query-structure/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Update all specs that describe query and mutation organization so they reflect the new per-model query directory layout and query key abstraction pattern, while removing deprecated references and keeping terminology consistent.

## Technical Context

**Language/Version**: TypeScript (Node.js for Express API, React for web UI)  
**Primary Dependencies**: Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Vite  
**Storage**: MongoDB (API persistence)  
**Testing**: N/A (no automated test requirement unless explicitly requested)  
**Target Platform**: Web app + Node.js API on macOS/Linux development environments
**Project Type**: Web application + REST API  
**Performance Goals**: API responses under 200ms for normal load  
**Constraints**: Maintain existing stack guardrails and documentation-only scope  
**Scale/Scope**: Documentation update across specs/ directory only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Frontend library mandates followed: TanStack Router for routing, TanStack Query for
  server state, Zustand for client state, Flowbite React for UI components, Tailwind CSS
  for styles, unplugin-icons for icons. No alternative libraries introduced.
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.

## Project Structure

### Documentation (this feature)

```text
specs/012-update-query-structure/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
express/
├── src/
│   ├── models/
│   ├── services/
│   └── routers/

web/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── queries/
│   ├── routes/
│   └── store/

specs/
└── 012-update-query-structure/
```

**Structure Decision**: Use the existing Express + React monorepo layout and focus updates exclusively in specs/ documentation. Reference the web/src/queries directory only for context in documentation, not as implementation instructions.

## Complexity Tracking

No constitution violations identified.
