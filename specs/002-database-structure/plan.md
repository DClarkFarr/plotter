# Implementation Plan: Database Structure

**Branch**: `[002-database-structure]` | **Date**: 2026-03-21 | **Spec**: [specs/002-database-structure/spec.md](specs/002-database-structure/spec.md)
**Input**: Feature specification from `/specs/002-database-structure/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Define MongoDB data models and CRUD helpers for users, stories, tags, plots, scenes, and sessions. Add indexes for uniqueness and lookup performance, and enforce referential checks at the model/service boundary to prevent invalid story, plot, tag, or user references.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 (Node.js)  
**Primary Dependencies**: Express 5.2, MongoDB Node driver 6.16  
**Storage**: MongoDB  
**Testing**: Not configured (no automated tests)  
**Target Platform**: Node.js server (local dev + production deployment)  
**Project Type**: Web service (Express API)  
**Performance Goals**: CRUD operations under 200ms p95 for normal load  
**Constraints**: MongoDB queries must live in `express/src/models`; validation on all inputs  
**Scale/Scope**: ~10k users, stories with 10s-100s of plots/scenes

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
│   └── routers/

web/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
```

**Structure Decision**: Express backend in `express/src` with models and services; React frontend in `web/src`. This feature only touches backend models and supporting services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

## Post-Design Constitution Check

- Stack guardrails honored (Express + MongoDB backend in `express/`).
- Clean Architecture boundaries preserved (models only for DB access).
- Routing and services remain thin; CRUD helpers live in models.
- Input validation and security requirements remain in scope for services/routers.
- Performance target (<200ms p95) maintained via indexed lookups.
