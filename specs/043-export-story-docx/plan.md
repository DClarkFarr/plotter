# Implementation Plan: Export Story to .docx

**Branch**: `043-export-story-docx` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/043-export-story-docx/spec.md`

## Summary

Add an "Export to .docx" option to the story card overflow menu on the dashboard. Clicking it triggers a server-side docx generation endpoint (`POST /stories/:storyId/export/docx`) that assembles a Word document mirroring the list view structure — acts (H1), chapters (H2), scenes (H3) with plot label, POV character, colour-coded tags, rich-text description and snippets — and returns the binary for immediate browser download. An info toast with a scaled countdown (5 s + 0.3 s × scene count) appears while the request is in flight and auto-dismisses when the file is ready.

## Technical Context

**Language/Version**: TypeScript 5 (backend: Node.js 18+, frontend: React 18)  
**Primary Dependencies**:

- Backend new: `docx` (v9, programmatic docx generation), `node-html-parser` (Tiptap HTML → docx primitives)
- Backend existing: Express 5, MongoDB native driver, `officeparser` (read-only, unchanged)
- Frontend existing: TanStack Query v5, TanStack Router v1, Zustand v5, axios, react-toastify v11, Flowbite React, Tailwind CSS, unplugin-icons  
  **Storage**: MongoDB (read-only during export — no writes)  
  **Testing**: None required (per constitution)  
  **Target Platform**: Node.js server (Express) + browser  
  **Project Type**: Web application (Express backend + React frontend)  
  **Performance Goals**: Export of up to 50 scenes completes in < 15 s (SC-003); toast appears within 500 ms of click (SC-002)  
  **Constraints**: No new frontend libraries; all styling via Tailwind; icons via unplugin-icons; export is server-side only  
  **Scale/Scope**: Per-user, per-story operation; no concurrency concerns beyond normal request handling

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
specs/043-export-story-docx/
├── plan.md              # This file
├── research.md          # Phase 0 — library decisions and technical unknowns
├── data-model.md        # Phase 1 — data shapes and transformation contracts
├── quickstart.md        # Phase 1 — dev setup and manual verification steps
├── contracts/
│   └── export-endpoint.md  # Phase 1 — REST endpoint contract
└── tasks.md             # Phase 2 — NOT created by /speckit.plan
```

### Source Code

```text
express/
├── package.json                          # ADD: docx, node-html-parser
└── src/
    ├── routers/
    │   └── storyRouter.ts                # ADD: POST /:storyId/export/docx route
    ├── services/
    │   └── storyExportService.ts         # NEW: orchestrates data fetch + docx assembly
    └── utils/
        ├── htmlToDocx.ts                 # NEW: converts Tiptap HTML → docx Paragraph/TextRun[]
        └── listViewOrder.ts              # NEW: server-side port of web/src/utils/listViewOrdering.ts

web/
└── src/
    ├── api/
    │   └── stories.ts                    # ADD: exportStoryDocx(storyId, sceneCount) function
    ├── hooks/
    │   └── useStories.ts                 # ADD: useExportStoryMutation hook
    └── components/
        └── dashboard/
            └── StoryCard.tsx             # ADD: "Export to .docx" DropdownItem + toast logic
```

**Structure Decision**: Web application (Option 2). All backend additions live inside `express/src/`; all frontend additions inside `web/src/`. No new top-level projects or directories are introduced.

## Complexity Tracking

> No constitution violations. All changes fall within existing Clean Architecture boundaries.
