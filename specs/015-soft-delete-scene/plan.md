# Implementation Plan: Soft Delete Scene

**Branch**: `015-soft-delete-scene` | **Date**: 2026-03-29 | **Spec**: [specs/015-soft-delete-scene/spec.md](specs/015-soft-delete-scene/spec.md)
**Input**: Feature specification from `/specs/015-soft-delete-scene/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a destructive delete section to the scene form that opens a Flowbite confirmation modal and, on confirm, performs a soft delete. Implement server-side soft delete via a `deletedAt` timestamp, update scene queries to exclude deleted records, ensure story stats and scene counts ignore deleted scenes, and clear UI selection/close sidebar with cache updates and error alerts on failure.

## Technical Context

**Language/Version**: TypeScript (Node.js + React)
**Primary Dependencies**: Express, MongoDB, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, dnd-kit, TipTap
**Storage**: MongoDB (scene documents)
**Testing**: No automated testing required unless requested
**Target Platform**: Web app + Node.js API server
**Project Type**: Web application with REST API
**Performance Goals**: API responses under 200ms for typical load
**Constraints**: Flowbite Modal with `ModalBody` (not `Modal.Body`); soft delete must not leak into active queries; use alert helper for errors
**Scale/Scope**: Stories with scenes across multiple plots; deletion affects active story grid only

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
specs/015-soft-delete-scene/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md
```

### Source Code (repository root)

```text
express/
├── src/
│   ├── models/
│   │   └── scenes.ts
│   ├── services/
│   │   ├── sceneService.ts
│   │   ├── storyService.ts
│   │   └── plotService.ts
│   └── routers/
│       ├── sceneRouter.ts
│       └── storyRouter.ts

web/
├── src/
│   ├── api/
│   │   └── stories.ts
│   ├── components/
│   │   └── story/
│   │       └── SceneForm.tsx
│   ├── queries/
│   │   ├── scene/
│   │   │   └── scene-mutations.ts
│   │   └── story/
│   │       └── story-queries.ts
│   ├── store/
│   │   ├── sceneEditorStore.ts
│   │   └── sidebarStore.ts
│   └── utils/
│       └── alert.tsx
```

**Structure Decision**: Web application with Express backend and React frontend. Existing scene data paths are extended to support soft delete and deletion UI.

## Complexity Tracking

No violations.

## Phase 0: Research

Findings captured in [specs/015-soft-delete-scene/research.md](specs/015-soft-delete-scene/research.md), covering soft delete data shape, index strategy, delete API shape, and Flowbite modal constraints.

## Phase 1: Design & Contracts

Artifacts produced:

- Data model in [specs/015-soft-delete-scene/data-model.md](specs/015-soft-delete-scene/data-model.md)
- API contracts in [specs/015-soft-delete-scene/contracts/api.md](specs/015-soft-delete-scene/contracts/api.md)
- Quickstart in [specs/015-soft-delete-scene/quickstart.md](specs/015-soft-delete-scene/quickstart.md)

## Phase 1: Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh copilot` after artifacts are generated.

## Constitution Check (Post-Design)

All core principles remain satisfied. No deviations required.
