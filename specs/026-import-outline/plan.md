# Implementation Plan: Import Outline Modal

**Branch**: `026-import-outline` | **Date**: 2026-04-06 | **Spec**: [specs/026-import-outline/spec.md](specs/026-import-outline/spec.md)
**Input**: Feature specification from `/specs/026-import-outline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a dashboard import button that opens an import outline modal with formatting guidance, a .docx uploader, and a preview step. Implement a new upload endpoint that accepts a .docx file with a `mode` of `preview` or `create`; preview returns a stub summary for now, and create returns a stub completion response plus a new story id.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.3 (Node.js + React 19.2.4)  
**Primary Dependencies**: Express 5.2.1, MongoDB 6.16, multer 1.4.5, React 19.2, TanStack Router/Query, Zustand, Flowbite React, Tailwind CSS, axios 1.13  
**Storage**: MongoDB; local filesystem for uploaded assets in `uploads/` (no persistence needed for preview yet)  
**Testing**: No automated test framework configured  
**Target Platform**: Web browser (Vite) + Node.js server on macOS/Linux  
**Project Type**: Web application with API  
**Performance Goals**: Keep API responses under 200ms for typical load  
**Constraints**: Validate user input, enforce .docx upload size limit, follow existing session auth  
**Scale/Scope**: Single-tenant workspace with moderate story sizes (<200 scenes)

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
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── utils/
│   └── types/
└── scripts/

web/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── queries/
│   ├── routes/
│   ├── store/
│   └── utils/
```

**Structure Decision**: Web application with Express backend and React frontend in existing `express/` and `web/` directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

## Phase 0 Research Findings

See [specs/026-import-outline/research.md](specs/026-import-outline/research.md) for decisions on endpoint shape, upload handling, and UI flow.

## Phase 1 Design Overview

- Add a non-story-scoped upload endpoint that accepts a .docx file with `mode` in multipart form data.
- Add a service layer stub that returns a preview summary and create confirmation placeholders.
- Add a dashboard import modal with instructions, uploader, and a preview state that shows a TODO summary.

## Post-Design Constitution Check

- No stack changes; uses existing Express, React, Flowbite, Tailwind, TanStack Query/Router, Zustand, and multer.
- Service/router separation maintained with a dedicated import service.
