# Implementation Plan: Create Scene Editor Flow

**Branch**: `010-create-scene-flow` | **Date**: March 27, 2026 | **Spec**: [specs/010-create-scene-flow/spec.md](specs/010-create-scene-flow/spec.md)
**Input**: Feature specification from [specs/010-create-scene-flow/spec.md](specs/010-create-scene-flow/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a create-scene flow from empty plot cells that creates a scene with a default title, selects it, and opens the sidebar editor. The editor uses in-place inputs for title/description, supports rich text content, offers tag selection via a modal, and manages a sortable todo checklist. Backend support adds scene endpoints and service/model helpers aligned with existing story and plot patterns.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.4 (web), Node.js + TypeScript (express)  
**Primary Dependencies**: Vite 8.0.1, Tailwind CSS 4.2.2, Flowbite React 0.12.17, TanStack Router 1.168.1, TanStack Query 5.94.5, Zustand 5.0.12, Express, MongoDB  
**Storage**: MongoDB (existing)  
**Testing**: None required currently (manual validation only)  
**Target Platform**: Web app + API server  
**Project Type**: Full-stack web application (React frontend + Express API)  
**Performance Goals**: Keep create/select flow under 2 seconds; API responses under 200ms typical load  
**Constraints**: Tailwind-only styling; use Flowbite components where available; no new third-party libraries beyond constitution amendments  
**Scale/Scope**: Story dashboard UI, scene sidebar editor, and scene API endpoints

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
- **Pending amendment**: Rich text editor and drag-and-drop libraries must be added to the constitution before implementation.

## Project Structure

### Documentation (this feature)

```text
specs/010-create-scene-flow/
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
│   │   ├── plot/
│   │   └── story/
│   ├── hooks/
│   ├── pages/
│   ├── store/
│   └── styles/
```

**Structure Decision**: Web application layout with updates to Express routers/services/models and React components, hooks, and state stores.

## Phase 0: Research Summary

Reference: [specs/010-create-scene-flow/research.md](specs/010-create-scene-flow/research.md)

## Phase 1: Design Summary

- Data model: [specs/010-create-scene-flow/data-model.md](specs/010-create-scene-flow/data-model.md)
- API contract: [specs/010-create-scene-flow/contracts/scenes-api.md](specs/010-create-scene-flow/contracts/scenes-api.md)
- Quickstart: [specs/010-create-scene-flow/quickstart.md](specs/010-create-scene-flow/quickstart.md)

## Complexity Tracking

| Violation                             | Why Needed                               | Simpler Alternative Rejected Because                 |
| ------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Add drag-and-drop library (dnd-kit)   | Required for sortable todo checklist     | Native DnD lacks accessibility and UX parity         |
| Add rich text editor library (TipTap) | Required for formatted scene description | Plain textarea does not meet formatting requirements |

## Constitution Check (Post-Design)

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- Frontend library mandates followed: TanStack Router for routing, TanStack Query for
  server state, Zustand for client state, Flowbite React for UI components, Tailwind CSS
  for styles, unplugin-icons for icons. No alternative libraries introduced.
- Clean Architecture boundaries enforced; routing remains thin.
- Routes use Express router; services compose workflow; models own MongoDB queries.
- Input validation and error handling follow security-first requirements.
- Performance and environment base URL requirements addressed.
- **Action required**: Amend constitution to add dnd-kit and TipTap before implementation.
