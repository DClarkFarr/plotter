# Implementation Plan: Sync Optimistic Shift Logic

**Branch**: `031-sync-optimistic-shifts` | **Date**: 2026-04-10 | **Spec**: [specs/031-sync-optimistic-shifts/spec.md](specs/031-sync-optimistic-shifts/spec.md)
**Input**: Feature specification from `/specs/031-sync-optimistic-shifts/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Align optimistic UI updates and cache shift logic for scene and section mutations with the backend `getMoveRangeShift` and related grid-shift rules. Update web mutation handlers to apply the same shift outcomes used by server responses, ensuring immediate grid updates match the final saved layout for create, delete, and move flows.

## Technical Context

**Language/Version**: TypeScript (Node.js + React)  
**Primary Dependencies**: Express, MongoDB driver, TanStack Query, TanStack Router, Zustand, Flowbite React, Tailwind CSS, dnd-kit  
**Storage**: MongoDB  
**Testing**: No automated tests required (manual QA)  
**Target Platform**: Web app + Node.js API server  
**Project Type**: Web application with REST API  
**Performance Goals**: API responses under 200ms for normal load; optimistic UI updates should appear immediately after user action  
**Constraints**: Stack guardrails and clean architecture boundaries per constitution  
**Scale/Scope**: Story grid interactions for scene/section create, delete, and move within a single story

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
specs/031-sync-optimistic-shifts/
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
│   ├── routers/
│   ├── services/
│   └── utils/

web/
├── src/
│   ├── queries/
│   ├── routes/
│   ├── components/
│   └── state/
```

**Structure Decision**: Web application with Express API in express/ and React frontend in web/.

## Complexity Tracking

No constitution violations.
