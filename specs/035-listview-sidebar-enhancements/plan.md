# Implementation Plan: ListView Sidebar Enhancements

**Branch**: `035-listview-sidebar-enhancements` | **Date**: 2026-04-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/035-listview-sidebar-enhancements/spec.md`

## Summary

Enhance the sticky Virtuoso sidebar in `ListView.tsx` to be a fully functional, styled navigation panel. Changes span three concerns: (1) visual polish — acts and chapters get larger text, scene entries get a plot-colored left border; (2) navigation — clicking a sidebar entry scrolls the main list to that item via DOM IDs; (3) bidirectional scroll sync — as the user scrolls the main list, IntersectionObserver tracks the active item and the sidebar Virtuoso scrolls to highlight it, showing a sky-700 background and arrow icon; (4) filter state — sidebar entries reflect the filter exclusion state, with disabled entries in "hide" mode.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, react-virtuoso 4.18.4, Tailwind CSS, unplugin-icons (MDI)  
**Storage**: N/A — pure frontend UI change, no persistence  
**Testing**: No automated tests required (per constitution)  
**Target Platform**: Web browser (desktop focus, same as existing list view)  
**Project Type**: Web application (React SPA in `web/`)  
**Performance Goals**: Scroll sync must not visibly lag; IntersectionObserver is preferred over scroll event polling  
**Constraints**: No new third-party libraries; must use only Virtuoso's own scroll API (`VirtuosoHandle.scrollIntoView`) for sidebar sync  
**Scale/Scope**: Single component enhancement — `ListView.tsx` and its sidebar item renderer

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ Stack guardrails honored — frontend-only change in `web/`, no backend modifications.
- ✅ No new libraries introduced. IntersectionObserver is a native browser API. Virtuoso scroll API is the existing `react-virtuoso` package.
- ✅ Icons use unplugin-icons with MDI (`~icons/mdi/...`).
- ✅ Styles via Tailwind CSS utilities only — existing inline CSS variables (`--plot-color`) pattern continued.
- ✅ No routing, server state, or Zustand changes required. `filterVisibilityMode` and all filter state are already read from `useStoryStore`.
- ✅ No Clean Architecture boundary violations — this is entirely a component-layer concern.

## Project Structure

### Documentation (this feature)

```text
specs/035-listview-sidebar-enhancements/
├── plan.md        ← this file
├── research.md    ← Phase 0 output
├── data-model.md  ← Phase 1 output
├── quickstart.md  ← Phase 1 output
└── tasks.md       ← Phase 2 output (/speckit.tasks)
```

### Source Code (affected files)

```text
web/src/
├── components/story/
│   ├── ListView.tsx           # Main change: IDs on list items, IntersectionObserver, activeIndex state, sidebar item renderer updated
│   ├── ListViewSidebarItem.tsx  # NEW: extracted sidebar item component (scene + section variants)
│   └── ListViewScene.tsx      # Unchanged
└── utils/
    └── listViewOrdering.ts    # Unchanged — existing OrderedSceneEntry types reused
```

│ ├── services/
│ └── api/
└── tests/

## Complexity Tracking

_No constitution violations. No complexity justification required._
