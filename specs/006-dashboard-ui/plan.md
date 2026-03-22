# Implementation Plan: User Dashboard

**Branch**: `006-dashboard-ui` | **Date**: March 21, 2026 | **Spec**: [specs/006-dashboard-ui/spec.md](specs/006-dashboard-ui/spec.md)
**Input**: Feature specification from `/specs/006-dashboard-ui/spec.md`

## Summary

Deliver a clean, modern dashboard experience with a fixed topbar, avatar dropdown, story grid, and create-story modal. Use Flowbite React for UI components, Tailwind for layout, TanStack Query for story data, and the shared axios `apiClient` for all story endpoints. Ensure the dashboard page does not scroll; the grid area scrolls, and overlays do not enable page-level scrolling.

## Technical Context

**Language/Version**: TypeScript 5.9 (React 19.2)  
**Primary Dependencies**: TanStack Router 1.168, TanStack Query 5.94, Flowbite React 0.12, Tailwind CSS 4.2, Zustand 5.0, axios 1.13, unplugin-icons 23  
**Storage**: MongoDB via Express backend (frontend uses API only)  
**Testing**: None specified (manual verification)  
**Target Platform**: Modern browsers (desktop + mobile)  
**Project Type**: Web application (React SPA + Express API)  
**Performance Goals**: Smooth UI interactions and scrolling at 60 fps  
**Constraints**: No page-level scroll on dashboard; overlays must not trigger body scroll  
**Scale/Scope**: Single dashboard area, two routes, basic story CRUD (list/create/read)

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
specs/006-dashboard-ui/
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
└── tests/

web/
├── src/
│   ├── api/
│   │   └── stories.ts
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CreateStoryModal.tsx
│   │   │   ├── StoryCard.tsx
│   │   │   └── StoryGrid.tsx
│   │   └── layout/
│   │       ├── DashboardLayout.tsx
│   │       └── DashboardTopbar.tsx
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   └── story.tsx
│   ├── routes/
│   │   ├── dashboard.tsx
│   │   └── dashboard/
│   │       └── story.$storyId.tsx
│   └── store/
│       └── authStore.ts
└── tests/
```

**Structure Decision**: Use the existing web/ and express/ split. All JSX lives in web/src/components and web/src/pages; routes only wire page components.

## Phase 0 Research Findings

Reference: [specs/006-dashboard-ui/research.md](specs/006-dashboard-ui/research.md)

- Flowbite React is the UI foundation for topbar, dropdown, modal, buttons, and cards.
- TanStack Query owns story list and create mutations; no server data in component state.
- Story API calls are implemented in `web/src/api/stories.ts` using the shared axios `apiClient`.

## Phase 1 Design Summary

Reference artifacts:

- Data model: [specs/006-dashboard-ui/data-model.md](specs/006-dashboard-ui/data-model.md)
- Contracts: [specs/006-dashboard-ui/contracts/stories-api.md](specs/006-dashboard-ui/contracts/stories-api.md)
- Quickstart: [specs/006-dashboard-ui/quickstart.md](specs/006-dashboard-ui/quickstart.md)

Design highlights:

- Dashboard layout uses a fixed topbar and a scrollable grid section within the main content.
- Avatar dropdown derives initials per clarified rules and closes on outside click or Esc.
- Create-story modal collects a required title and redirects on success.

## Constitution Check (Post-Design)

- All stack guardrails remain satisfied.
- Flowbite React and Tailwind are used for UI composition.
- TanStack Query and axios `apiClient` govern server data and HTTP calls.
- No new libraries or architecture deviations required.

## Complexity Tracking

No constitution violations.
