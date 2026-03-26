# Implementation Plan: Plot Header Grid Enhancements

**Branch**: `008-plot-header-grid` | **Date**: 2026-03-25 | **Spec**: [specs/008-plot-header-grid/spec.md](specs/008-plot-header-grid/spec.md)
**Input**: Feature specification from `/specs/008-plot-header-grid/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add plot header creation, editing, and move actions in the grid while enforcing a disabled scene-creation state for plotless columns. Implement plot create/update endpoints, add TanStack Query mutations with optimistic cache updates, and introduce a plot header view/edit component with hover toolbar and a native color picker.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js backend, React frontend)  
**Primary Dependencies**: Express, MongoDB, React, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, axios  
**Storage**: MongoDB  
**Testing**: Not required (manual validation only)  
**Target Platform**: Web app + API server  
**Project Type**: Full-stack web application (React frontend + Express API)  
**Performance Goals**: Keep interactive grid updates responsive; API responses under 200ms typical load  
**Constraints**: Use only approved libraries; no new UI libs beyond Flowbite/Tailwind; optimistic updates via TanStack Query  
**Scale/Scope**: Single story page flows; plot header create/edit/move and disabled scene creation state

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
│   │   └── plot/
│   ├── hooks/
│   └── pages/
```

**Structure Decision**: Web application with Express backend and React frontend using existing plot components and story routers.

## Phase 0: Research Summary

Reference: [specs/008-plot-header-grid/research.md](specs/008-plot-header-grid/research.md)

## Phase 1: Design Summary

- Data model: [specs/008-plot-header-grid/data-model.md](specs/008-plot-header-grid/data-model.md)
- API contract: [specs/008-plot-header-grid/contracts/plots-api.md](specs/008-plot-header-grid/contracts/plots-api.md)
- Quickstart: [specs/008-plot-header-grid/quickstart.md](specs/008-plot-header-grid/quickstart.md)

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
