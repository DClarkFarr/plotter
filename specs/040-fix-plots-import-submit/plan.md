# Implementation Plan: Fix Plot Customizations Submission on Import

**Branch**: `040-fix-plots-import-submit` | **Date**: 2026-04-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/040-fix-plots-import-submit/spec.md`

## Summary

Replace `plotTagIds: string[]` in `ImportCustomizations` with `plots: ImportPlotCustomization[]` — an array that carries each plot's `id`, `name`, `color`, `isDefaultPlot`, and `ignored` flags. Update both the shared type files, the server router + service, and the preview modal + tabs component so that plot colors, default selection, and ignore choices made in the UI are serialized into `customizations` and fully honoured on import.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 backend, React 18 frontend)
**Primary Dependencies**: Express + MongoDB (backend); React + TanStack Query + Flowbite React + Tailwind CSS (frontend)
**Storage**: MongoDB (via existing `createPlot` model function)
**Testing**: None required per constitution
**Target Platform**: Web (browser + Node.js server)
**Project Type**: Web application (express/ backend + web/ frontend)
**Performance Goals**: No additional performance requirements; existing <200ms API target applies
**Constraints**: `exactOptionalPropertyTypes` is enabled — build payloads conditionally
**Scale/Scope**: Single endpoint change + 4 source files touched

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ Stack guardrails honored — Express + MongoDB backend in express/, React in web/.
- ✅ Frontend library mandates followed — TanStack Query mutation unchanged; Flowbite React tabs unchanged; Tailwind CSS for styles; no new libraries.
- ✅ Clean Architecture boundaries enforced — router validates input only; service owns workflow; models own DB writes.
- ✅ Routes remain thin — validation logic stays in router, plot creation logic stays in service.
- ✅ Input validation updated in router to reflect new `plots` array structure.
- ✅ No performance concerns — this is a pure data-shape change with no new queries.

## Project Structure

### Documentation (this feature)

```text
specs/040-fix-plots-import-submit/
├── plan.md              ← this file
├── research.md          ✅
├── data-model.md        ✅
├── quickstart.md        ✅
├── contracts/
│   └── POST-imports-outline.md  ✅
└── tasks.md             (created by /speckit.tasks)
```

### Source Code (files touched)

```text
express/
└── src/
    ├── types/
    │   └── importOutline.ts          # Add ImportPlotCustomization; replace plotTagIds with plots
    ├── routers/
    │   └── importRouter.ts           # Update customizations validation
    └── services/
        └── importOutlineService.ts   # Replace plotTagIds logic with plots array

web/
└── src/
    ├── api/
    │   └── types.ts                  # Add ImportPlotCustomization; update ImportCustomizations
    └── components/
        └── dashboard/
            ├── ImportOutlineModal.tsx          # Init state; remove onChangeTags / tag mutation
            └── ImportOutlinePreviewTabs.tsx    # Remove onChangeTags prop; rewrite TagsTab + PlotsTab
```

**Structure Decision**: Web application (Option 2). No new files; 6 existing files modified.

## Complexity Tracking

No constitution violations.
