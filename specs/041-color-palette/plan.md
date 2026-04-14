# Implementation Plan: Color Palette System

**Branch**: `041-color-palette` | **Date**: April 13, 2026 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/041-color-palette/spec.md`

## Summary

Add a per-story color palette system: a new `colors` MongoDB collection stores 10 color entries per resource (user or story), seeded lazily on first request via a user→defaults cascade. The backend exposes `GET` and `PATCH` endpoints under `/api/stories/:storyId/colors`. The frontend adds a palette-edit sidebar panel (sortable list with drag handles, color pickers, hex inputs, and ignore checkboxes) and a reusable `ColorPaletteDropdown` component that replaces all three existing native `type="color"` inputs (tag creation form, plot header edit, import modal plots tab).

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5 (Node.js 20 backend, React 18 frontend)  
**Primary Dependencies**: Express, Mongoose/MongoDB (backend); TanStack Query, Zustand, Flowbite React, Tailwind CSS, dnd-kit/core + dnd-kit/sortable, unplugin-icons (frontend)  
**Storage**: MongoDB — new `colors` collection  
**Testing**: No automated tests required for this feature  
**Target Platform**: Web application (browser + Node.js server)  
**Project Type**: Web application (Express API + React SPA)  
**Performance Goals**: GET /colors under 200ms p95; palette dropdown opens under 200ms  
**Constraints**: Lazy seeding (no migration); no new third-party libraries beyond already-approved stack  
**Scale/Scope**: Per-story palette; 10 fixed color slots per story

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
specs/041-color-palette/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── colors-api.md
└── tasks.md             # created by /speckit.tasks
```

### Source Code (repository root)

```text
express/
├── src/
│   ├── models/
│   │   └── colors.ts             # NEW — colors collection model
│   ├── services/
│   │   └── colorService.ts       # NEW — getStoryColors, updateStoryColor
│   └── routers/
│       └── colorRouter.ts        # NEW — GET + PATCH /stories/:storyId/colors[/:colorId]
│   (apiRouter.ts — register colorRouter)
│   (models/collections.ts — add "colors" entry)

web/
├── src/
│   ├── types/
│   │   └── color.ts              # NEW — StoryColor type
│   ├── api/
│   │   └── colors.ts             # NEW — API client functions
│   ├── hooks/
│   │   └── useStoryColors.ts     # NEW — TanStack Query hook
│   ├── components/
│   │   ├── ui/
│   │   │   └── ColorPaletteDropdown.tsx  # NEW — reusable palette dropdown
│   │   └── story/
│   │       └── ColorPalettePanel.tsx     # NEW — sidebar palette editor
│   ├── store/
│   │   └── sidebarStore.ts       # MODIFY — add "palette" to SidebarView
│   ├── pages/
│   │   └── story.tsx             # MODIFY — add Color Palette button to Assets
│   └── components/layout/
│       └── DashboardLayout.tsx   # MODIFY — render ColorPalettePanel for "palette" view
│   (CreateTagForm.tsx — replace type="color" with ColorPaletteDropdown)
│   (PlotHeader.tsx — replace type="color" with ColorPaletteDropdown)
│   (ImportOutlinePreviewTabs.tsx — replace type="color" + hardcoded palette with ColorPaletteDropdown)
```

**Structure Decision**: Web application (Express backend + React frontend). All new backend files follow the model → service → router layering already established in the codebase. All new frontend files follow the types → API client → hook → component layering. No new third-party libraries required beyond the already-approved `@dnd-kit/core` and `@dnd-kit/sortable`.

## Complexity Tracking

> No constitution violations. All patterns used are already present in the codebase.
