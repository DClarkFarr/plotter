# Implementation Plan: Plot Grid Utilities

**Branch**: `029-plot-grid-utils` | **Date**: 2026-04-10 | **Spec**: [specs/029-plot-grid-utils/spec.md](specs/029-plot-grid-utils/spec.md)
**Input**: Feature specification from `/specs/029-plot-grid-utils/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Introduce plot grid utility methods that coordinate shifting behavior for add, remove, and move operations. Add downward and range-limited shift helpers, then refactor scene and section services to use them so inserts and removals shift only when the target index is occupied or becomes empty, and moves only affect the bounded range between indices.

## Technical Context

**Language/Version**: TypeScript (Node.js backend, React frontend)  
**Primary Dependencies**: Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons  
**Storage**: MongoDB  
**Testing**: Not required (manual validation only)  
**Target Platform**: Web app + API server
**Project Type**: Full-stack web application (Express API + React frontend)  
**Performance Goals**: Plot grid updates remain responsive; API responses under 200ms typical load  
**Constraints**: Use only approved libraries; no direct MongoDB queries outside models  
**Scale/Scope**: Plot grid utilities for add/remove/move operations in story editing

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
specs/029-plot-grid-utils/
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
│   └── utils/
```

**Structure Decision**: Backend-only changes in Express services/models with shared plot-grid utilities in `express/src/utils`.

## Phase 0: Research Summary

Reference: [specs/029-plot-grid-utils/research.md](specs/029-plot-grid-utils/research.md)

## Phase 1: Design Summary

- Data model: [specs/029-plot-grid-utils/data-model.md](specs/029-plot-grid-utils/data-model.md)
- API contract: [specs/029-plot-grid-utils/contracts/README.md](specs/029-plot-grid-utils/contracts/README.md)
- Quickstart: [specs/029-plot-grid-utils/quickstart.md](specs/029-plot-grid-utils/quickstart.md)

## Complexity Tracking

No constitution violations identified.

## Constitution Check (Post-Design)

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Frontend library mandates followed: TanStack Router for routing, TanStack Query for
  server state, Zustand for client state, Flowbite React for UI components, Tailwind CSS
  for styles, unplugin-icons for icons. No alternative libraries introduced.
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.
