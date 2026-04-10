# Implementation Plan: Sections Collection

**Branch**: `028-sections-collection` | **Date**: April 10, 2026 | **Spec**: [specs/028-sections-collection/spec.md](specs/028-sections-collection/spec.md)
**Input**: Feature specification from [specs/028-sections-collection/spec.md](specs/028-sections-collection/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a new sections collection tied to stories, with typed entries (act/section) and vertical ordering. Extend backend services and routers to create, list, and update sections, including grid shift behavior that moves scenes and sections upward when needed. Update frontend API types, HTTP helpers, and query/mutation logic to manage sections and apply grid shifts in client state, aligning with existing plot/scene patterns.

## Implementation Outline

- Backend data model: add `sections` collection and indexes, plus model helpers for create/list/update and upward shifting by story/verticalIndex.
- Backend services: add section creation/update/list operations with story validation and type enforcement; integrate section shifts into grid-shift utilities.
- Backend routing: add section endpoints under stories; return created/updated section plus any shifted resources as needed for client state sync.
- Frontend API/types: define `Section` types and HTTP helpers for list/create/update; add TanStack Query hooks and cache updates.
- Grid shift behavior: update client and server shift-grid logic to account for sections and to shift scenes across all plots when inserting sections at occupied vertical indices.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express)
**Primary Dependencies**: Express 5.2.1, MongoDB 6.16.0, Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12
**Storage**: MongoDB (existing)
**Testing**: None required currently (manual validation only)
**Target Platform**: Web app + API server
**Project Type**: Full-stack web application (React frontend + Express API)
**Performance Goals**: Keep section create/update under 2 seconds; API responses under 200ms typical load
**Constraints**: Tailwind-only styling; Flowbite components where available; no new libraries beyond constitution amendments
**Scale/Scope**: Story grid data (plots, scenes, sections) and related API + client state updates

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
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

````text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
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
│   ├── hooks/
│   ├── pages/
│   ├── queries/
│   ├── store/
│   └── utils/
````

**Structure Decision**: Web application layout with updates to Express routers/services/models and React API/query layers.

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

## Phase 0: Research Summary

Reference: [specs/028-sections-collection/research.md](specs/028-sections-collection/research.md)

## Phase 1: Design Summary

- Data model: [specs/028-sections-collection/data-model.md](specs/028-sections-collection/data-model.md)
- API contract: [specs/028-sections-collection/contracts/sections-api.md](specs/028-sections-collection/contracts/sections-api.md)
- Quickstart: [specs/028-sections-collection/quickstart.md](specs/028-sections-collection/quickstart.md)

## Constitution Check (Post-Design)

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Frontend library mandates followed: TanStack Router for routing, TanStack Query for
  server state, Zustand for client state, Flowbite React for UI components, Tailwind CSS
  for styles, unplugin-icons for icons. No alternative libraries introduced.
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.
