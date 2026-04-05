# Implementation Plan: Scene Snippets

**Branch**: `023-scene-snippets` | **Date**: 2026-04-05 | **Spec**: [specs/023-scene-snippets/spec.md](specs/023-scene-snippets/spec.md)
**Input**: Feature specification from `/specs/023-scene-snippets/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add scene snippets to the Tasks sidebar and list view, storing each snippet as a label + rich text HTML in the scene document. Use the existing scene update API and TanStack Query mutations with optimistic updates, avoid state updates in `useEffect`, and render snippet editors with the full TipTap toolbar. The list view presents snippets with extra horizontal margins and a typewriter-inspired visual style.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Express + React)  
**Primary Dependencies**: TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, TipTap, dnd-kit  
**Storage**: MongoDB via Express API  
**Testing**: Manual QA (no automated tests required)  
**Target Platform**: Web (modern browsers) + Node.js API  
**Project Type**: Web app + API  
**Performance Goals**: Keep scene updates and sidebar rendering responsive; API responses under 200ms typical load  
**Constraints**: No new libraries; follow scene update API patterns; avoid state updates in `useEffect` by handling side effects in event handlers  
**Scale/Scope**: Scene editing and list view snippets only

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
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
express/
├── src/
│   ├── models/
│   │   └── scenes.ts
│   ├── services/
│   │   └── sceneService.ts
│   └── routers/
│       └── sceneRouter.ts

web/
├── src/
│   ├── api/
│   │   └── types.ts
│   ├── components/
│   │   ├── story/
│   │   │   ├── SceneForm.tsx
│   │   │   ├── SceneTodoList.tsx
│   │   │   └── ListViewScene.tsx
│   │   └── forms/
│   │       └── RichTextEditor.tsx
│   ├── queries/
│   │   └── scene/
│   │       └── scene-mutations.ts
│   └── store/
│       └── sceneEditorStore.ts
├── src/
│   ├── components/
**Structure Decision**: Extend existing scene editing and list view components in `web/` and update scene model/router/service in `express/` to include snippets.

## Phase 0: Outline & Research

- Produce [specs/023-scene-snippets/research.md](specs/023-scene-snippets/research.md) with decisions on snippet storage, API update approach, editor mode, and UI state handling.

## Phase 1: Design & Contracts

### Data Model

- Produce [specs/023-scene-snippets/data-model.md](specs/023-scene-snippets/data-model.md) describing snippets on the scene document and UI state for collapsed/expanded items.

### Contracts

- Produce [specs/023-scene-snippets/contracts/scenes-api.md](specs/023-scene-snippets/contracts/scenes-api.md) describing snippet fields in create/update and scene responses.

### Quickstart

- Produce [specs/023-scene-snippets/quickstart.md](specs/023-scene-snippets/quickstart.md) with manual verification steps.

### Agent Context Update

- Run `.specify/scripts/bash/update-agent-context.sh copilot` after artifacts are created.

## Phase 1 (Post-Design) Constitution Check

- Stack guardrails honored; no new libraries introduced beyond TipTap already required.
- Express router/service/model updates stay within clean architecture boundaries.
- TanStack Query continues to own server state; Zustand remains for UI-only state.
- Input validation and error handling follow current scene update patterns.

## Phase 2: Task Planning Preview

- Add `snippets` to `SceneDefinition`, `SceneDocument`, and update payloads in the Express model, service, and router.
- Extend scene API types and TanStack Query mutation payloads to handle snippet updates.
- Build sidebar snippet UI (collapsed list, expand to edit) using `RichTextEditor` in full mode; trigger updates from event handlers (no `useEffect` updates).
- Add add-snippet modal and list-view snippet rendering with extra horizontal margins and a typewriter-like style.
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

No constitution violations.

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
