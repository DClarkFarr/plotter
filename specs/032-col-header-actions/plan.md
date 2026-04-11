# Implementation Plan: Col Header Row Actions (Grid Shift Endpoint + Sections Render)

**Branch**: `032-col-header-actions` | **Date**: 2026-04-11 | **Spec**: [specs/032-col-header-actions/spec.md](specs/032-col-header-actions/spec.md)
**Input**: Feature specification from `/specs/032-col-header-actions/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a story grid shift endpoint to persist row insert/remove actions and wire the column header buttons to call it with optimistic UI shifts. Extend the plot grid rendering to include section rows with inline editable titles, act/chapter styling, and a centered 4px guide line across the remaining row width.

## Technical Context

**Language/Version**: TypeScript (Node.js + React 19)  
**Primary Dependencies**: TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, dnd-kit  
**Storage**: MongoDB (backend), N/A for UI-only state  
**Testing**: No automated tests required (manual QA)  
**Target Platform**: Web app + Node.js API server
**Project Type**: Web application with REST API  
**Performance Goals**: Hover actions appear immediately; row insert/remove updates should feel instant and reconcile with server shifts  
**Constraints**: Stack guardrails and clean architecture boundaries per constitution  
**Scale/Scope**: Plot grid column header actions and section row rendering within a single story

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
│   ├── routers/
│   │   └── storyRouter.ts (add grid shift endpoint)
│   ├── services/
│   │   └── storyGridService.ts (new)
│   └── utils/
│       └── plotGridUtils.ts (reuse shift helpers)

web/
├── src/
│   ├── api/
│   │   └── stories.ts (new grid shift API call)
│   ├── queries/
│   │   └── story/
│   │       └── story-mutations.ts (new grid shift mutation)
│   ├── components/
│   │   └── plot/
│   │       ├── PlotGrid.tsx (render sections in grid)
│   │       ├── ColHeader.tsx (call grid shift mutation)
│   │       └── SectionRow.tsx (new inline edit row)
│   └── styles/
│       └── PlotGrid.scss (extend section row styling as needed)
```

**Structure Decision**: Web application with Express API in express/ and React frontend in web/. A new story grid shift endpoint is added to the story router and consumed via TanStack Query mutations. Section rows are rendered in the plot grid with a dedicated component.

## Complexity Tracking

No constitution violations.
