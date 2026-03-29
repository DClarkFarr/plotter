# Implementation Plan: Assets Management

**Branch**: `014-assets-management` | **Date**: 2026-03-29 | **Spec**: [specs/014-assets-management/spec.md](specs/014-assets-management/spec.md)
**Input**: Feature specification from `/specs/014-assets-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add an Assets section to the Portal top menu that opens sidebar views for managing story tags and characters. Tags are listed like scene selection but without checkboxes and allow renaming the main tag title. Characters are listed with image and color, support search, and allow inline editing of image, name, and description, plus deletion when not assigned to any scenes. Implement backend support for character updates and deletion checks, add an upload endpoint serving a public `/uploads` directory with stored relative image URLs, and wire the frontend to use `VITE_CDN_BASE_URL` for image display.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js + React)  
**Primary Dependencies**: Express, MongoDB, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons, dnd-kit, TipTap  
**Storage**: MongoDB for story data; filesystem `/uploads` for character images (served publicly)  
**Testing**: No automated testing required unless requested  
**Target Platform**: Web app + Node.js API server  
**Project Type**: Web application with REST API  
**Performance Goals**: API responses under 200ms for typical load  
**Constraints**: Honor stack guardrails; use environment-specific base URLs; store image URLs as relative paths  
**Scale/Scope**: Stories with up to a few hundred characters and tags

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
│   │   ├── characters.ts
│   │   ├── scenes.ts
│   │   └── tags.ts
│   ├── services/
│   │   ├── characterService.ts
│   │   └── tagService.ts
│   └── api/
│       ├── characterRouter.ts
│       ├── storyRouter.ts
│       └── uploadRouter.ts
└── tests/

web/
├── src/
│   ├── components/
│   │   ├── portal/
│   │   └── story/
│   ├── pages/
│   │   └── portal/
│   └── services/
│   ├── api/
│   ├── queries/
│   └── routes/
└── tests/
```

**Structure Decision**: Option 2 (web application with Express backend and React frontend). Existing paths under express/ and web/ will be extended for assets management and uploads.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations.

## Phase 0: Research

Focus on upload handling, static asset serving, and character deletion constraints. Findings are captured in [specs/014-assets-management/research.md](specs/014-assets-management/research.md).

## Phase 1: Design & Contracts

Artifacts produced:

- Data model in [specs/014-assets-management/data-model.md](specs/014-assets-management/data-model.md)
- API contracts in [specs/014-assets-management/contracts/api.md](specs/014-assets-management/contracts/api.md)
- Quickstart in [specs/014-assets-management/quickstart.md](specs/014-assets-management/quickstart.md)

## Phase 1: Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh copilot` after artifacts are generated.

## Constitution Check (Post-Design)

All core principles remain satisfied. No deviations required.
