# Implementation Plan: Create Tag Form Reuse

**Branch**: `020-tag-create-form` | **Date**: 2026-04-04 | **Spec**: [specs/020-tag-create-form/spec.md](specs/020-tag-create-form/spec.md)
**Input**: Feature specification from `/specs/020-tag-create-form/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Create a shared create-tag form component and use it in both the tag management view and scene tagging modal so users can add tags consistently in both contexts.

## Technical Context

**Language/Version**: TypeScript (React)  
**Primary Dependencies**: React, TanStack Query, TanStack Router, Flowbite React, Tailwind CSS  
**Storage**: N/A (frontend only)  
**Testing**: None required (manual verification only)  
**Target Platform**: Web (Vite dev server + production build)  
**Project Type**: Web application  
**Performance Goals**: Keep UI interactions responsive; no extra network calls beyond existing create tag mutation  
**Constraints**: Must use Flowbite React + Tailwind; no new libraries  
**Scale/Scope**: Small UI refactor within story components

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

Result: PASS

## Project Structure

### Documentation (this feature)

```text
specs/020-tag-create-form/
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
└── src/

web/
├── src/
│   ├── components/
│   │   └── story/
│   └── queries/
└── public/
```

**Structure Decision**: Web application structure with shared story components in `web/src/components/story`.

## Complexity Tracking

No constitution violations identified.

## Post-Design Constitution Check

- Stack guardrails honored; changes remain within the existing React frontend.
- Flowbite React and Tailwind remain the UI layer; no new dependencies introduced.
- Clean Architecture boundaries unaffected (UI-only refactor).
