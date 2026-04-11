# Implementation Plan: Section Sidebar Editing

**Branch**: `034-section-sidebar-edit` | **Date**: 2026-04-11 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/034-section-sidebar-edit/spec.md`

## Summary

Add sidebar editing for sections, mirroring the scene editing pattern. Clicking the edit button on a `SectionRow` opens the right-hand sidebar in `"section"` view mode, rendering a new `SectionForm` component. The form provides auto-saved title editing, a WYSIWYG description editor, and a delete action with confirmation. Requires adding an optional `description` field to the `Section` data model across both backend (MongoDB document, service, router) and frontend (types, mutation optimistic update).

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 backend, React 18 frontend)  
**Primary Dependencies**: Express (backend), React + TanStack Query + Zustand + TipTap + Flowbite React (frontend)  
**Storage**: MongoDB (existing `sections` collection — additive field only)  
**Testing**: Manual verification (no automated test suite in place for this project)  
**Target Platform**: Web browser (desktop-first)  
**Project Type**: Web application (express/ backend + web/ frontend)  
**Performance Goals**: API response < 200ms; debounced auto-save 300ms  
**Constraints**: No new third-party libraries; constitution guardrails apply  
**Scale/Scope**: Single-user story editing; no concurrent write concerns

## Constitution Check

_GATE: Verified — no violations._

- Stack guardrails honored: Express + MongoDB backend in `express/`; React frontend in `web/`.
- TanStack Query used for all server state (mutations); Zustand for client UI state (sectionEditorStore, sidebarStore).
- No new third-party libraries introduced; TipTap (already used in `SceneForm`) used for the rich-text editor.
- Flowbite React `Modal` used for the delete confirmation dialog.
- Tailwind CSS utilities for all styling. unplugin-icons for any new icons.
- Clean Architecture: router stays thin; service trims/validates title; model owns MongoDB query.
- No MongoDB queries outside `models/`.

## Project Structure

### Documentation (this feature)

```text
specs/034-section-sidebar-edit/
├── plan.md           ← this file
├── research.md       ← Phase 0
├── data-model.md     ← Phase 1
├── quickstart.md     ← Phase 1
├── contracts/
│   └── section-api.md
└── tasks.md          ← created by /speckit.tasks
```

### Source Code (files changed by this feature)

```text
express/
└── src/
    ├── models/
    │   └── sections.ts          ← add description field
    ├── services/
    │   └── sectionService.ts    ← thread description through create/update
    └── routers/
        └── sectionRouter.ts     ← expose description in responses; parse in PATCH/POST

web/
└── src/
    ├── api/
    │   └── types.ts             ← add description to Section, CreateSectionInput, UpdateSectionInput
    ├── store/
    │   ├── sectionEditorStore.ts  ← NEW — Zustand store for selected section
    │   └── sidebarStore.ts        ← add "section" to SidebarView union
    ├── queries/
    │   └── section/
    │       └── section-mutations.ts  ← add description to optimistic update in useUpdateSectionMutation
    └── components/
        ├── story/
        │   └── SectionForm.tsx       ← NEW — sidebar form component
        ├── plot/
        │   └── SectionRow.tsx        ← add missing useSectionEditorStore import
        └── layout/
            └── DashboardLayout.tsx   ← add currentView === "section" case
```

**Structure Decision**: Web application (Option 2). Backend in `express/`, frontend in `web/`. No new top-level directories.

## Complexity Tracking

_No constitution violations. No complexity justification required._
