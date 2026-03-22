# Implementation Plan: User Dashboard

**Branch**: `006-dashboard-ui` | **Date**: 2026-03-21 | **Spec**: /specs/006-dashboard-ui/spec.md
**Input**: Feature specification from `/specs/006-dashboard-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the dashboard UI with a topbar, avatar dropdown, story grid, and a create-story modal that redirects to the new story page. Use Flowbite React + Tailwind for UI, TanStack Router for navigation, and TanStack Query for listing and creating stories via the shared axios `apiClient`, backed by an Express `POST /stories` endpoint and existing story routes.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.3, Node.js (current LTS)  
**Primary Dependencies**: Express 5.2.x, MongoDB driver 6.16.x, React 19.2.x, TanStack Router/Query, Flowbite React, Tailwind CSS, Zustand, axios  
**Storage**: MongoDB  
**Testing**: None required (manual verification only)  
**Target Platform**: Web browsers + Node.js server  
**Project Type**: Web app + API service  
**Performance Goals**: <200ms normal-load API responses  
**Constraints**: No page-level scrolling on dashboard; overlays do not enable page scroll  
**Scale/Scope**: Single dashboard flow (list + create + detail shell)

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

Post-design check: No violations identified.

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
│   ├── hooks/
│   ├── pages/
│   └── routes/

specs/006-dashboard-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

**Structure Decision**: Use the existing split `express/` + `web/` layout with dashboard UI in `web/src` and story APIs in `express/src`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
