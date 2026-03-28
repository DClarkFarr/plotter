# Implementation Plan: Tag Variant Management

**Branch**: `013-tag-variant-management` | **Date**: 2026-03-28 | **Spec**: [specs/013-tag-variant-management/spec.md](specs/013-tag-variant-management/spec.md)
**Input**: Feature specification from [specs/013-tag-variant-management/spec.md](specs/013-tag-variant-management/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add variant-aware tag management in the SceneTagsModal, including a dedicated tag row component with expandable variant management, new API support for toggling variant status and managing variants, and scene tag selection data that records which variant is chosen for a scene. Prevent deletion of variants that are in use and display the selected variant in collapsed rows.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Node.js + React)  
**Primary Dependencies**: Express, MongoDB driver, TanStack Router, TanStack Query, Zustand, Flowbite React, Tailwind CSS, unplugin-icons  
**Storage**: MongoDB  
**Testing**: None specified  
**Target Platform**: Web (browser) + Node.js API
**Project Type**: Web application with API  
**Performance Goals**: Variant list expand/collapse under 1s for up to 50 variants  
**Constraints**: API responses under 200ms p95; no new libraries  
**Scale/Scope**: Story editor UI and tag management workflows

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
│   ├── services/
│   └── routers/

web/
├── src/
│   ├── components/
│   ├── pages/
│   ├── queries/
│   ├── api/
│   └── store/
```

**Structure Decision**: Use the existing Express API in express/src and React app in web/src with tag-related UI in web/src/components/story and mutations in web/src/queries/tag.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
