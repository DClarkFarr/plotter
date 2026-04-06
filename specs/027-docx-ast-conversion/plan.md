# Implementation Plan: Docx AST Conversion

**Branch**: `027-docx-ast-conversion` | **Date**: 2026-04-06 | **Spec**: [specs/027-docx-ast-conversion/spec.md](specs/027-docx-ast-conversion/spec.md)
**Input**: Feature specification from `/specs/027-docx-ast-conversion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement docx parsing for outline import by converting the uploaded file into a structured document tree, mapping it into acts, chapters, scenes, tags, characters, and snippets, and returning a consistent preview/create payload for the existing import endpoint.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js + React)  
**Primary Dependencies**: Express, MongoDB driver, multer, officeparser, React, TanStack Router/Query, Zustand, Flowbite React, Tailwind CSS  
**Storage**: MongoDB; in-memory file parsing for docx uploads  
**Testing**: No automated test framework configured  
**Target Platform**: Web browser (Vite) + Node.js server on macOS/Linux
**Project Type**: Web application with API  
**Performance Goals**: Import a conforming docx (up to 200 pages) within 2 minutes; keep typical API responses under 200ms  
**Constraints**: Validate inputs, enforce .docx file type and size limits, preserve formatting metadata, follow existing auth  
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

See [specs/027-docx-ast-conversion/research.md](specs/027-docx-ast-conversion/research.md) for decisions on docx structure rules, tag/character parsing, and snippet detection.

## Phase 1 Design Overview

- Extend the import outline service to parse the uploaded docx into a document tree and map it into act, chapter, and scene elements.
- Add a parser module that extracts POV, tags (including variants and highlight color), characters, and snippets, while preserving HTML formatting for act content and scene text.
- Generate stable tag and character sets keyed by normalized name and link them to scenes by id; return `elements`, `tags`, and `characters` in the preview response.
- Surface parsing issues (missing required headings, malformed tags) as structured import feedback for preview mode and return 422 on create when errors exist.

## Post-Design Constitution Check

- No stack changes; continues using Express, MongoDB, React, TanStack Router/Query, Zustand, Flowbite, Tailwind, and multer with the added officeparser dependency.
- Service/router separation maintained with parsing logic in services/utils and routers remaining thin.
