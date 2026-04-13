---
description: "Task list for import preview UI"
---

# Tasks: Import Preview UI

**Input**: Design documents from `/specs/039-import-preview-ui/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared types and wire-up changes that every other phase depends on.

- [x] T001 Add `ImportCustomizations` type to `express/src/types/importOutline.ts`
- [x] T002 [P] Add `ImportCustomizations` interface and extend `ImportOutlineInput` with optional `customizations` field in `web/src/api/types.ts`
- [x] T003 [P] Extend `ImportOutlineResponse` with optional `elements`, `tags`, `characters`, and `issues` fields in `web/src/api/types.ts`

**Checkpoint**: All shared types are defined; downstream tasks can import them.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend router update and API function update that every user story depends on — must be complete before any UI or service customization work can be wired end-to-end.

- [x] T004 Parse and validate optional `customizations` JSON form field in `express/src/routers/importRouter.ts`; throw `ValidationError` on invalid JSON; pass value into `importOutlineForStory`
- [x] T005 Add `customizations: ImportCustomizations | null` to `ImportOutlinePayload` in `express/src/services/importOutlineService.ts`
- [x] T006 Append `customizations` JSON string to `FormData` in `importStoryOutline` in `web/src/api/stories.ts`

**Checkpoint**: The API can round-trip a `customizations` payload; the service accepts it without using it yet.

---

## Phase 3: User Story 1 — Tabbed Preview Layout (Priority: P1) 🎯 MVP

**Goal**: Replace the placeholder preview `<div>` in `ImportOutlineModal` with a three-tab layout that renders all three panes using the preview response data.

**Independent Test**: Upload any `.docx`, reach the preview step, and confirm three tabs ("Characters", "Elements", "Tags & Plots") are visible and switch without error, even if data is empty.

### Implementation for User Story 1

- [x] T007 [US1] Store the full `ImportOutlineResponse` (not just `summary`) in `previewData` state and add `customizations` state initialized to the empty defaults in `web/src/components/dashboard/ImportOutlineModal.tsx`
- [x] T008 [US1] Create `ImportOutlinePreviewTabs` component shell (no tab content yet) with Flowbite `Tabs` and three empty `TabItem` panes labeled "Characters", "Elements", "Tags & Plots" in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T009 [US1] Replace the placeholder preview `<div>` in the `preview` step of `ImportOutlineModal.tsx` with `<ImportOutlinePreviewTabs>`, wiring `previewData` arrays and `customizations` state
- [x] T010 [US1] Add empty-state messages to each tab pane for when the corresponding data array is empty or undefined in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T011 [US1] Pass `customizations` as `input.customizations` in `handleApprove` inside `web/src/components/dashboard/ImportOutlineModal.tsx`; reset `customizations` to defaults in `resetState`

**Checkpoint**: User Story 1 is independently functional — tabs render, switch, and preserve state.

---

## Phase 4: User Story 2 — Characters Tab (Priority: P2)

**Goal**: The Characters tab lists all detected characters with Ignore and Merge With controls that update the `customizations` state.

**Independent Test**: Upload a `.docx` with at least three characters. Ignore one → row grays out and strikes through. Merge another → select a target from the dropdown → merge is recorded. Approve import → ignored character absent, merged alias resolved to target.

### Implementation for User Story 2

- [x] T012 [US2] Render the Characters tab list: one row per character with character name on the left and a right-aligned action group in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T013 [US2] Implement Ignore checkbox: toggling adds/removes the character ID from `ignoredCharacterIds`; row receives `opacity-50 line-through` classes when ignored in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T014 [US2] Implement Merge With button: clicking shows an inline `<select>` populated with all non-ignored characters excluding self in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T015 [US2] Implement merge target selection: selecting an option sets `characterMerges[id] = selectedId`; a clear (×) control resets the mapping back to no merge in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T016 [US2] Apply character customizations in the `create` branch of `importOutlineService.ts`: build `skipIds` from `ignoredCharacterIds` ∪ keys of `characterMerges`; skip those IDs in the creation loop; after loop, apply merge remappings to `charIdMap`

**Checkpoint**: User Story 2 is independently functional — ignore and merge are applied in the created story.

---

## Phase 5: User Story 3 — Elements Tab (Priority: P3)

**Goal**: The Elements tab renders a read-only nested outline of acts, chapters, and scenes. Scenes show a secondary line with POV and tag badges.

**Independent Test**: Upload a `.docx` with acts, chapters, and scenes (some with POV and tags). Switch to the Elements tab and verify correct nesting, POV badge, and tag badges. A document with no acts or chapters should still show scenes at root level.

### Implementation for User Story 3

- [x] T017 [US3] Render acts as `text-base font-bold` rows in the Elements tab in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T018 [US3] Render chapters as `text-sm font-semibold pl-4` rows nested under acts in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T019 [US3] Render scenes as `text-sm pl-8` rows with a secondary line beneath the title in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T020 [US3] Render POV badge on the secondary line: look up character name from the `characters` prop by `povCharacterId`; show a small pill; omit when `povCharacterId` is null in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T021 [US3] Render tag badges on the secondary line: look up tag names from the `tags` prop by each `tagId`; include variant label when present; show one badge per tag in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`

**Checkpoint**: User Story 3 is independently functional — full outline hierarchy with POV and tag badges is visible.

---

## Phase 6: User Story 4 — Tags & Plots Tab (Priority: P4)

**Goal**: The Tags & Plots tab lists all detected tags. Plain tags show a "Convert to plot" checkbox. Variant-syntax tags are read-only. Approved import creates Plot documents for checked tags, assigns scenes accordingly.

**Independent Test**: Upload a `.docx` with a mix of plain tags and `[tag:variant]` tags. Check "Convert to plot" on one plain tag. Verify the variant tags have no checkbox. Approve — the plain tag checked item appears as a Plot row in the story, not a tag; scenes referencing it are in that plot.

### Implementation for User Story 4

- [x] T022 [US4] Group tags by name in the Tags & Plots tab; render each name group as a section in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T023 [US4] For tags with `variant != null`, show the tag name + variant label and a "Tag only" indicator (no checkbox) in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T024 [US4] For the null-variant entry within each group, show a "Convert to plot" checkbox: checking adds `tag.id` to `plotTagIds`; unchecking removes it in `web/src/components/dashboard/ImportOutlinePreviewTabs.tsx`
- [x] T025 [US4] Apply plot tag customizations in `importOutlineService.ts`: filter `plotTagIds` to tags with `variant == null`; log a warning issue for any that are variant tags; call `createPlot` for each eligible unique tag name (starting `horizontalIndex` at 1 after the Main plot); register in `plotMap`
- [x] T026 [US4] Skip plot-designated tag IDs in the existing tag creation loop in `importOutlineService.ts`
- [x] T027 [US4] During scene creation in `importOutlineService.ts`: split `tagIds` into `plotTagRefs` (in `plotMap`) and `normalTagRefs`; assign scene to the matching plot ObjectId (first match wins; log warning if multiple); strip `plotTagRefs` from `tags`/`tagVariants`; fall back to Main plot when no plot-tag refs

**Checkpoint**: User Story 4 is independently functional — plot-designated tags create Plot documents and scenes are routed to them.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T028 [P] Validate `customizations` structure after JSON parse in `express/src/routers/importRouter.ts`: ensure `ignoredCharacterIds` and `plotTagIds` are arrays and `characterMerges` is an object; throw `ValidationError` if not
- [x] T029 Run quickstart.md validation: upload a `.docx`, step through all three tabs, apply all customization types, approve, and verify the resulting story in the dashboard

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks end-to-end wiring
- **Phase 3 (US1)**: Depends on Phases 1–2
- **Phase 4 (US2)**: Depends on Phase 3 (tabs shell must exist); backend half can be done after Phase 2
- **Phase 5 (US3)**: Depends on Phase 3; independent of Phase 4
- **Phase 6 (US4)**: Depends on Phase 3; backend half depends on Phase 2
- **Phase 7 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Tab shell — must complete first; all other stories add content into it
- **US2 (P2)**: Independent of US3/US4 once US1 shell exists; backend piece independent of US3/US4
- **US3 (P3)**: Read-only; fully independent of US2/US4 once US1 shell exists
- **US4 (P4)**: Frontend piece independent of US2/US3 once US1 shell exists; backend piece independent of US2/US3

### Parallel Opportunities

- T002 and T003 are in the same file but touch different interfaces — can be done as one commit
- T004 (router) and T007 (modal state) can be done in parallel after Phase 1
- T012–T015 (Characters tab UI) can be done alongside T017–T021 (Elements tab UI) after T009
- T022–T024 (Tags tab UI) can be done alongside US2/US3 UI tasks after T009
- T016 (US2 backend), T025–T027 (US4 backend) can be done in parallel after Phase 2

---

## Parallel Example: User Story 2 + User Story 3

```bash
# After T009 (tabs shell wired) these can proceed simultaneously:
Task: "T012–T015: Implement Characters tab UI in ImportOutlinePreviewTabs.tsx"
Task: "T017–T021: Implement Elements tab read-only outline in ImportOutlinePreviewTabs.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (tab shell + modal wiring)
4. Complete Phase 4: US2 (Characters tab + backend ignore/merge)
5. Validate: upload a doc, ignore/merge characters, approve, confirm in story

### Incremental Delivery

1. US1 (tab shell) → validate tabs render
2. US2 (Characters tab) → validate ignore + merge
3. US3 (Elements tab) → validate outline structure
4. US4 (Tags & Plots tab) → validate plot creation
