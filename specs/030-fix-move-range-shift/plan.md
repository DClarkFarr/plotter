# Implementation Plan: Fix Move Range Shift Logic

**Branch**: `030-fix-move-range-shift` | **Date**: 2026-04-10 | **Spec**: [specs/030-fix-move-range-shift/spec.md](specs/030-fix-move-range-shift/spec.md)
**Input**: Feature specification from `/specs/030-fix-move-range-shift/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement `getMoveRangeShift` using the detailed move notes so it returns a consistent bounded shift plan based on plot/story occupancy and resource type, then update scene and section services to call the new props-based signature and apply the returned shift. Ensure same-row moves return no shift, cross-plot same-row moves shift only when occupied, and adjacent or multi-row moves shift only the relevant range.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js backend, React frontend)  
**Primary Dependencies**: Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons  
**Storage**: MongoDB  
**Testing**: Not required (manual validation only)  
**Target Platform**: Web app + API server
**Project Type**: Full-stack web application (Express API + React frontend)  
**Performance Goals**: Plot grid updates remain responsive; API responses under 200ms typical load  
**Constraints**: Use only approved libraries; no direct MongoDB queries outside models  
**Scale/Scope**: Move shift logic for plot grid updates in story editing

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
specs/030-fix-move-range-shift/
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

```text
express/
├── src/
│   ├── services/
│   │   ├── sceneService.ts
│   │   └── sectionService.ts
│   └── utils/
│       └── plotGridUtils.ts
```

**Structure Decision**: Backend-only changes in `express/src/utils` and `express/src/services`.

## Phase 0: Research Summary

Reference: [specs/030-fix-move-range-shift/research.md](specs/030-fix-move-range-shift/research.md)

## Phase 1: Design Summary

- Data model: [specs/030-fix-move-range-shift/data-model.md](specs/030-fix-move-range-shift/data-model.md)
- API contract: [specs/030-fix-move-range-shift/contracts/README.md](specs/030-fix-move-range-shift/contracts/README.md)
- Quickstart: [specs/030-fix-move-range-shift/quickstart.md](specs/030-fix-move-range-shift/quickstart.md)

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
