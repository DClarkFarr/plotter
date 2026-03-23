# Implementation Plan: Story Page Data Hookup

**Branch**: `007-story-page-data` | **Date**: 2026-03-22 | **Spec**: [specs/007-story-page-data/spec.md](specs/007-story-page-data/spec.md)
**Input**: Feature specification from `/specs/007-story-page-data/spec.md`

## Summary

Deliver the story page data flow by fetching story, tags, and plots (with scenes) from the API using TanStack Query hooks, wiring the story id from the route, and introducing a Zustand story UI store for filter and card display settings. Add a dedicated story heading component that toggles view/edit, updates title and description via a mutation, and returns to view mode with refreshed data. Provide loading and error states across the page.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19 (web), Node.js + Express 5 (api)  
**Primary Dependencies**: TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, Axios, unplugin-icons, Vite  
**Storage**: MongoDB  
**Testing**: None required (manual verification)  
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari)  
**Project Type**: Web app + API  
**Performance Goals**: Story page ready state in <= 2s under normal conditions  
**Constraints**: API p95 < 200ms; no new state or UI libraries outside constitution  
**Scale/Scope**: Single story page flow, story metadata edit, story-level tags/plots

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
specs/007-story-page-data/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── story-page-api.md
└── tasks.md
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
│   │   └── story/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   └── store/
```

**Structure Decision**: Continue the existing Express + React split; story page logic lives under web/, with new API endpoints (if missing) in express/routers and supporting services/models.

## Phase 0: Research

- Confirm endpoint shapes for story tags and plots (with scenes) and determine the story update API contract.
- Decide on UI state ownership: TanStack Query for server data, Zustand for story UI state.
- Confirm no rich text library should be added; use a simple editable input until the constitution names a rich text library.

## Phase 1: Design & Contracts

- Define story page data model (story, tag, plot, scene, and UI state).
- Document API contracts for story detail, story tags, story plots with scenes, and story update.
- Add quickstart instructions for running the story page with required params.
- Update agent context via `.specify/scripts/bash/update-agent-context.sh copilot`.

**Post-Design Constitution Check**: Pass (no deviations).

## Phase 2: Implementation Plan

### Backend (Express)

- Add story tags endpoint (proposed `GET /stories/:storyId/tags`) with auth and ownership checks.
- Add story plots endpoint (proposed `GET /stories/:storyId/plots`) returning plots populated with scenes.
- Add story update endpoint (`PATCH /stories/:storyId`) for title/description edits.
- Keep routing thin; delegate to services and models for data access.

### Frontend (React)

- Add API client functions for story detail, story tags, story plots, and story update.
- Add React Query hooks in web/src/hooks for story, tags, plots, and update mutation.
- Create a Zustand story store for filters, card size, and card display settings.
- Update the story route to pass the story id into the StoryPage state.
- Build a StoryHeading component with view/edit mode, optimistic update, cancel/save.
- Add loading skeletons and error states to the story page layout.

### Validation

- Verify loader/skeleton display while queries are pending.
- Verify story title/description render from data and update on save.
- Verify tags and plots (with scenes) render for valid story id.
- Verify error state on invalid story id or API failure.

## Complexity Tracking

No constitution violations.
