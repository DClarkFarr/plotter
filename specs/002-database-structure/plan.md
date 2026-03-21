# Implementation Plan: Database Structure Refactor

**Branch**: `[002-database-structure]` | **Date**: 2026-03-21 | **Spec**: [specs/002-database-structure/spec.md](specs/002-database-structure/spec.md)
**Input**: Feature specification from `/specs/002-database-structure/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refactor Express data access to enforce strict model boundaries: models stay CRUD-only with no cross-model imports, while domain services orchestrate multi-collection workflows using model functions. Add an automated check to prevent model-to-model imports and update services to comply with “no direct MongoDB calls.”

## Technical Context

**Language/Version**: Node.js + TypeScript 5.9  
**Primary Dependencies**: Express 5.2, MongoDB driver 6.16, ts-node, nodemon  
**Storage**: MongoDB  
**Testing**: No automated test framework configured  
**Target Platform**: Node.js server (macOS/Linux deploy targets)  
**Project Type**: Web service (Express API) with separate React frontend  
**Performance Goals**: <200ms p95 for standard API requests  
**Constraints**: Models are CRUD-only and must not import other models; services orchestrate workflows; services never call MongoDB driver directly  
**Scale/Scope**: Single API service with a single MongoDB database; moderate early-stage scale

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
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
│   ├── routers/
│   └── utils/

web/
├── src/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
```

**Structure Decision**: Use the existing Express backend in express/ and the React frontend in web/. This refactor only touches express/src/models and express/src/services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Plan

### Phase 0: Research and Decisions

- Confirm service/model boundaries, enforcement strategy, and service organization (documented in research.md).

### Phase 1: Design and Refactor Plan

- Define domain services and responsibilities (StoryService, PlotService, SceneService, UserService, SessionService, TagService).
- Map current cross-model imports and move their logic to services.
- Ensure models expose only CRUD and single-collection helpers; any multi-collection logic receives required related documents as input.
- Add automated enforcement to prevent model-to-model imports.

### Phase 2: Implementation Steps

1. Update model modules to remove cross-model imports and adjust signatures to accept related documents where needed.
2. Create/expand domain services to orchestrate multi-collection workflows using model functions only.
3. Update existing services to avoid direct MongoDB driver calls (use model functions instead).
4. Add lint/CI check to forbid model-to-model imports and document how to run it.
5. Validate behavior with smoke tests (create story, plot, scene, tags, session).
