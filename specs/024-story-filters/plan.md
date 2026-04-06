# Implementation Plan: Story Filters

**Branch**: `024-story-filters` | **Date**: 2026-04-05 | **Spec**: [specs/024-story-filters/spec.md](specs/024-story-filters/spec.md)
**Input**: Feature specification from `/specs/024-story-filters/spec.md`

**Note**: This plan is produced by the `/speckit.plan` workflow.

## Summary

Add story filters for tags, plots, characters, and custom text on the story page. The filters menu opens from the top bar, supports search and tag variant selection, and closes once a filter is applied or the custom text modal is opened. Active filters live in `storyStore`, render as badges in a top filters bar with per-filter removal and clear-all, and avoid duplicate entries for the same type and values.

## Technical Context

**Language/Version**: TypeScript (React 19 + Express 5)
**Primary Dependencies**: TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons
**Storage**: MongoDB via Express API (read-only for this feature)
**Testing**: Manual QA (no automated tests required)
**Target Platform**: Web (modern browsers) + Node.js API
**Project Type**: Web app + API
**Performance Goals**: Filter interactions feel instant; visible updates within 2 seconds of user action
**Constraints**: No new libraries; filters state in `storyStore`; close filters menu on apply or modal open; follow Flowbite/Tailwind UI patterns
**Scale/Scope**: Story page filters UI and state only

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
specs/024-story-filters/
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
│   ├── components/
│   │   └── story/
│   ├── pages/
│   │   └── story.tsx
│   ├── queries/
│   │   └── story/
│   │       └── story-queries.ts
│   └── store/
│       └── storyStore.ts
```

**Structure Decision**: Update story page UI and story store in `web/`, reusing existing story queries for tags/plots/characters. No backend changes required.

## Complexity Tracking

No constitution violations.

## Phase 0: Outline & Research

- Produce [specs/024-story-filters/research.md](specs/024-story-filters/research.md) with decisions on filter state shape, menu closing rules, and variant handling.

## Phase 1: Design & Contracts

### Data Model

- Produce [specs/024-story-filters/data-model.md](specs/024-story-filters/data-model.md) describing filter entities, values, and UI state.

### Contracts

- No new external contracts; reuse existing story queries. Document this in [specs/024-story-filters/contracts/README.md](specs/024-story-filters/contracts/README.md).

### Quickstart

- Produce [specs/024-story-filters/quickstart.md](specs/024-story-filters/quickstart.md) with manual verification steps.

### Agent Context Update

- Run `.specify/scripts/bash/update-agent-context.sh copilot` after artifacts are created.

## Phase 1 (Post-Design) Constitution Check

- Stack guardrails honored; no new libraries introduced.
- TanStack Query remains the source of server state; Zustand holds UI-only filter state.
- Flowbite React and Tailwind CSS used for UI; unplugin-icons used for icons.

## Phase 2: Task Planning Preview

- Extend `storyStore` with a `filters` array of `{ type, value1, value2 }` objects and actions to add, remove, replace, and clear filters.
- Build a filters menu anchored to the story top bar using Flowbite dropdowns, with nested selections for tags, plots, and characters, each including a search input.
- Implement tag variant selection with an All option; selecting a variant or All applies the filter and closes the filters menu.
- Add a custom text modal that applies a `search` filter on submit and closes the filters menu on open.
- Add a filters bar at the top of the story page that shows active filters as badges with per-filter remove actions and a clear-all button; hide the bar when no filters are active.
