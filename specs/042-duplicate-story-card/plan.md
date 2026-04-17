# Implementation Plan: Duplicate Story Card

**Branch**: `042-duplicate-story-card` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/042-duplicate-story-card/spec.md`

## Summary

Adds a contextual "..." dropdown to each story card on the dashboard. Selecting "Duplicate story" runs a full atomic server-side copy of the story and all its assets (colors, characters, tags, plots, scenes, sections), wrapped in a MongoDB transaction. The frontend shows an optimistic spinner placeholder card while the operation is pending, replaces it with the new story card on success (highlighted with the existing `isNew` glow), and fires a "story created" toast via the existing `alert` utility.

## Technical Context

**Language/Version**: TypeScript 5 (backend: Node.js 20 / Express; frontend: React 18 / Vite)  
**Primary Dependencies**: Express 4, MongoDB Node.js driver 6, TanStack Query v5, Zustand 4, Flowbite React, Tailwind CSS, unplugin-icons (MDI), react-toastify  
**Storage**: MongoDB (replica set required for transactions)  
**Testing**: No automated tests required per constitution  
**Target Platform**: Browser (web) + Node.js server (Express)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Duplication API response under 200ms for typical stories; placeholder card visible within 200ms of click  
**Constraints**: MongoDB transaction requires replica set mode; character image files are not file-copied  
**Scale/Scope**: Single-user story duplication; typical stories have 1–5 plots, 10–100 scenes, fewer than 20 tags/characters

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
specs/042-duplicate-story-card/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── duplicate-story.md   # API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
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
└── src/
    ├── models/
    │   ├── stories.ts        ← add duplicateStory()
    │   ├── tags.ts           ← add duplicateTagsByStory()
    │   ├── characters.ts     ← add duplicateCharactersByStory()
    │   ├── colors.ts         ← add duplicateColorsByStory()
    │   ├── plots.ts          ← add duplicatePlotsByStory()
    │   ├── scenes.ts         ← add duplicateScenesByPlots()
    │   └── sections.ts       ← add duplicateSectionsByStory()
    ├── services/
    │   └── storyDuplicateService.ts   ← NEW: orchestrates transaction
    └── routers/
        └── storyRouter.ts    ← add POST /:storyId/duplicate route

web/
└── src/
    ├── api/
    │   └── stories.ts        ← add duplicateStory() API call
    ├── hooks/
    │   └── useStories.ts     ← add useDuplicateStoryMutation()
    ├── store/
    │   └── dashboardStore.ts ← add duplicatingStoryIds + helpers
    └── components/
        └── dashboard/
            ├── DuplicatingCard.tsx    ← NEW: spinner placeholder card
            ├── StoryCard.tsx          ← add ellipsis icon + Dropdown
            └── StoryGrid.tsx          ← accept duplicatingStoryIds prop
```

**Structure Decision**: Web application (Option 2). Backend changes in `express/src/`, frontend in `web/src/`. No new top-level directories.

## Complexity Tracking

> No constitution violations. All patterns follow established conventions.
