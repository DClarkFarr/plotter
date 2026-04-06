# Implementation Plan: Filter Visibility Modes

**Branch**: `025-filter-visibility-modes` | **Date**: 2026-04-05 | **Spec**: [specs/025-filter-visibility-modes/spec.md](specs/025-filter-visibility-modes/spec.md)
**Input**: Feature specification from `/specs/025-filter-visibility-modes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a visibility-mode toggle next to the filter control and apply it consistently to the plot grid and story list. Introduce a shared filter-application helper that returns filtered plots plus included scene IDs, then use it to render excluded scenes as hidden/minified variants (including empty-state indicators when no scenes match).

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (web)  
**Primary Dependencies**: React, Vite, Zustand, TanStack Router, TanStack Query, Flowbite React, Tailwind CSS, unplugin-icons, dnd-kit  
**Storage**: N/A (frontend rendering of existing story data)  
**Testing**: No automated test requirement (manual validation)  
**Target Platform**: Modern desktop browsers (story planning UI)  
**Project Type**: Web application (frontend in web/ with Express backend in express/)  
**Performance Goals**: Maintain responsive grid/list rendering under filter toggles  
**Constraints**: No new libraries; use existing state/store patterns; preserve story filters behavior  
**Scale/Scope**: Typical story sizes; render within current grid/list performance expectations

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
specs/025-filter-visibility-modes/
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
│   └── api/
└── tests/

web/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application with frontend changes in web/ and no backend changes expected in express/.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Implementation Outline

1. Add a shared filter application helper that takes plots + filters and returns filtered plots plus included scene IDs.
2. Extend filter UI controls to include the visibility-mode toggle and tooltip copy.
3. Update plot grid to compute `plotsFiltered` before grid construction and pass `isFilterExcluded` to scene cards.
4. Update scene card rendering to show hide/minify variants based on filter visibility mode.
5. Update story list view to use the shared filter helper, render hide/minify variants, and show empty-state messaging when no scenes match.

## Post-Design Constitution Check

- No changes required to stack guardrails or mandated frontend libraries.
- UI changes remain within web/ and preserve architecture boundaries.
