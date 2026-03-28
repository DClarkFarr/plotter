# Implementation Plan: Scene POV Selection

**Branch**: `[011-scene-pov]` | **Date**: March 27, 2026 | **Spec**: [specs/011-scene-pov/spec.md](specs/011-scene-pov/spec.md)
**Input**: Feature specification from `/specs/011-scene-pov/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a character collection and POV reference on scenes, expose character list/create endpoints for stories, and update the scene sidebar to select a single POV (with avatar rendering and inline character creation) while displaying POV on scene cards.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js for backend, React 19 for frontend)  
**Primary Dependencies**: Express 5, MongoDB driver; TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, react-select  
**Storage**: MongoDB  
**Testing**: None (no automated testing required)  
**Target Platform**: Web (browser + Node.js API)  
**Project Type**: Web app with REST API backend  
**Performance Goals**: <200ms typical API response time  
**Constraints**: Stack guardrails, clean architecture boundaries, REST + JSON APIs  
**Scale/Scope**: Single product dashboard with story/scene workflows

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

Status: PASS

## Constitution Check (Post-Design)

Status: PASS

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
│   ├── routers/
│   └── utils/

web/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── store/
│   └── utils/
```

**Structure Decision**: Web application with Express API backend in `express/` and React frontend in `web/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Phase 0: Research

- Confirm data representation for POV (ObjectId reference on scene).
- Define character fields and creation flow aligned with story ownership.
- Validate API surface for listing/creating characters and updating scenes.

## Phase 1: Design & Contracts

- Update data model to include `pov` on scenes and new characters collection.
- Define REST contracts for character list/create and scene update responses.
- Produce quickstart steps for verifying POV selection and display.

## Phase 2: Implementation Plan

1. Backend: add characters model + service and extend scene model/service for POV storage and validation.
2. Backend: add story-scoped character list/create endpoints and include POV in scene responses.
3. Frontend: add POV selector to scene sidebar with react-select option rendering and inline character creation.
4. Frontend: show POV avatar/name on scene cards and ensure single-select behavior.
5. Validation and error handling across API and UI flows.
