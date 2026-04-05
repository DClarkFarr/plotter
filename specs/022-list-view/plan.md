# Implementation Plan: List View

**Branch**: `022-list-view` | **Date**: 2026-04-04 | **Spec**: [specs/022-list-view/spec.md](specs/022-list-view/spec.md)
**Input**: Feature specification from `/specs/022-list-view/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a list view on the story page that replaces the plot grid when selected, rendering scenes in written format with avatar, title, tags, description, and todos. The list ordering mirrors the plot grid (by `verticalIndex`, then plot `horizontalIndex`). Implementation centers on new list view components, reuse of `SceneTags`, `CharacterDisplay`, and shared tag badge styling with a size extension.

## Technical Context

**Language/Version**: TypeScript (frontend), React 18 (Vite)  
**Primary Dependencies**: TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons  
**Storage**: MongoDB via Express API (no schema changes)  
**Testing**: Manual QA (no automated tests required)  
**Target Platform**: Web (modern browsers)  
**Project Type**: Web app + API  
**Performance Goals**: Render list view for up to 100 scenes within ~2s on typical workstation  
**Constraints**: No new UI libraries; keep rich text rendering aligned with existing TipTap output; maintain clean architecture boundaries  
**Scale/Scope**: Story page list view only; no persistence changes

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
specs/022-list-view/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
express/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

web/
├── src/
│   ├── components/
│   │   ├── story/
│   │   │   ├── ListView.tsx
│   │   │   ├── ListViewScene.tsx
│   │   │   ├── ListViewTodoList.tsx
│   │   │   └── TagBadge.tsx
│   ├── pages/
│   │   └── story.tsx
│   ├── store/
│   │   └── storyStore.types.ts
│   └── utils/
│       └── listViewOrdering.ts
└── tests/
```

**Structure Decision**: Use the existing React app in `web/` for list view components and keep API untouched.

## Phase 0: Outline & Research

- Produce [specs/022-list-view/research.md](specs/022-list-view/research.md) with decisions on ordering, rich text rendering, todo ordering, display modes, and badge sizing.

## Phase 1: Design & Contracts

### Data Model

- Produce [specs/022-list-view/data-model.md](specs/022-list-view/data-model.md) describing list view entities and derived ordering model.

### Contracts

- No new external contracts required (UI-only feature).

### Quickstart

- Produce [specs/022-list-view/quickstart.md](specs/022-list-view/quickstart.md) with manual verification steps.

### Agent Context Update

- Run `.specify/scripts/bash/update-agent-context.sh copilot` after artifacts are created.

## Phase 1 (Post-Design) Constitution Check

- No changes to stack guardrails; feature remains within React + Tailwind + Flowbite.
- No new data access or API changes; clean architecture boundaries preserved.
- Rich text rendering reuses existing TipTap HTML output and styles.

## Phase 2: Task Planning Preview

- Implement list view components (`ListView`, `ListViewScene`, `ListViewTodoList`) and ordering utility.
- Wire story page to switch between `PlotGrid` and list view based on `cardDisplay`.
- Extend `TagBadge` with `size` prop to support list view sizing.
- Add edit action in list view scenes to open the scene editor sidebar.

## Complexity Tracking

No constitution violations.
