# Implementation Plan: Import Tags Modal

**Branch**: `021-import-tags-modal` | **Date**: 2026-04-04 | **Spec**: [specs/021-import-tags-modal/spec.md](specs/021-import-tags-modal/spec.md)
**Input**: Feature specification from [specs/021-import-tags-modal/spec.md](specs/021-import-tags-modal/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add an import-tags flow to the tag manager: an entry point opens a modal listing stories, then a comparison table that aligns origin tags with current-story tags, supports selection, and submits an import action. Implement a backend endpoint to copy selected tags from a source story to the current story with validation, de-duplication, and toast feedback.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9 (Node.js + React 19)  
**Primary Dependencies**: Express 5, MongoDB 6, React, TanStack Router, TanStack Query, Flowbite React, Zustand  
**Storage**: MongoDB  
**Testing**: None specified (manual verification only)  
**Target Platform**: Web app + Node.js API server
**Project Type**: Web application with API backend  
**Performance Goals**: Import request completes within 5 seconds for up to 100 tags  
**Constraints**: API responses under 200ms for typical operations; no new third-party UI libraries  
**Scale/Scope**: Single story tag imports, modal-level UI changes

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
│   ├── routers/
│   └── utils/

web/
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── stores/
```

**Structure Decision**: Web application with Express API backend using existing models/services/routers in express/ and React UI in web/.

## Implementation Approach

### Backend

- Add a new story tag import endpoint under the story router, accepting `fromStoryId`, `toStoryId`, and `tagIds` (array of tag ids) in the request.
- Validate that the authenticated user can access both stories.
- Load the selected tags from the source story, filter out any tags that already exist in the destination story by name, and create new tag documents under the destination story.
- Return the newly created tags (or counts) for client refresh and toast messaging.

### Frontend

- Add an "Import tags" button with tooltip in the ManageTagsPanel top-right area.
- Build a modal with two stages: story list view with "view tags" actions, then a tag comparison view.
- Use a two-column table layout that aligns rows by a shared alphabetical grouping key. Tags are sorted by name and grouped by first letter across both columns, inserting empty cells when one side has fewer tags for a letter.
- Render each tag row with color and name; clicking a left-side row toggles selected state with a stronger border and background.
- Use TanStack Query for story list, story tags, and import mutation; on success show toast, close modal, and refresh current story tags.

### Data Flow

- Fetch: stories list -> select source story -> fetch source tags + current story tags -> compute aligned table rows.
- Mutate: import tags -> backend creates tags -> client invalidates tag queries and closes modal on success.

## Phase 0: Research Summary

All technical choices align with the existing stack. No open clarifications remain.

## Phase 1: Design Artifacts

- [specs/021-import-tags-modal/research.md](specs/021-import-tags-modal/research.md)
- [specs/021-import-tags-modal/data-model.md](specs/021-import-tags-modal/data-model.md)
- [specs/021-import-tags-modal/quickstart.md](specs/021-import-tags-modal/quickstart.md)
- [specs/021-import-tags-modal/contracts/import-tags.md](specs/021-import-tags-modal/contracts/import-tags.md)

## Constitution Check (Post-Design)

- Stack guardrails honored (Express + MongoDB backend in express/, React in web/).
- TanStack Query used for server state and mutations; Zustand reserved for UI-only state.
- Flowbite React used for modal/button components; Tailwind CSS for styling.
- Router/services/models separation preserved in Express implementation.
- Input validation and error handling handled in router + services with validation helpers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
