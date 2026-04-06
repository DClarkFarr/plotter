---
description: "Task list for Docx AST Conversion"
---

# Tasks: Docx AST Conversion

**Input**: Design documents from `/specs/027-docx-ast-conversion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/import-outline.md

**Tests**: Not requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Constitution**: Include tasks for input validation, error handling, and performance targets where relevant.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Define import parse result types in express/src/types/importOutline.ts
- [x] T002 [P] Add docx parsing entrypoint module in express/src/services/importOutlineParser.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Implement docx-to-document-tree conversion using officeparser in express/src/services/importOutlineParser.ts
- [x] T004 Implement HTML serialization for docx runs (bold/italic/underline/color) in express/src/utils/docxHtml.ts
- [x] T005 Add shared normalization helpers for tag/character keys in express/src/utils/importNormalization.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Import a docx into story structure (Priority: P1) 🎯 MVP

**Goal**: Convert docx headings and paragraphs into ordered act, chapter, and scene elements with content and snippets.

**Independent Test**: Import a conforming docx and verify acts, chapters, scenes, and snippets are created with correct ordering and HTML content.

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement heading mapping (H1 act, H2 chapter, H4 scene) in express/src/services/importOutlineParser.ts
- [x] T007 [P] [US1] Map act body paragraphs to HTML content in express/src/services/importOutlineParser.ts
- [x] T008 [P] [US1] Implement scene body parsing into HTML content in express/src/services/importOutlineParser.ts
- [x] T009 [P] [US1] Implement snippet detection and grouping by indent in express/src/services/importOutlineParser.ts
- [x] T010 [US1] Integrate parser output into importOutlineForStory in express/src/services/importOutlineService.ts
- [x] T011 [US1] Extend preview response payload to include elements in express/src/services/importOutlineService.ts

**Checkpoint**: User Story 1 should be functional and independently testable

---

## Phase 4: User Story 2 - Understand and resolve import issues (Priority: P2)

**Goal**: Provide actionable parsing issues for malformed or incomplete docx files.

**Independent Test**: Import a malformed docx and verify that issues are returned with clear locations and error levels.

### Implementation for User Story 2

- [x] T012 [P] [US2] Define import issue collection rules in express/src/services/importOutlineParser.ts
- [x] T013 [P] [US2] Detect missing or out-of-order headings (act/chapter/scene) in express/src/services/importOutlineParser.ts
- [x] T014 [US2] Return issues in preview responses in express/src/services/importOutlineService.ts
- [x] T015 [US2] Block create mode when error-level issues exist in express/src/services/importOutlineService.ts
- [x] T016 [US2] Surface 422 errors for invalid documents in express/src/routers/importRouter.ts

**Checkpoint**: User Story 2 should return actionable errors without breaking preview flows

---

## Phase 5: User Story 3 - Preserve tags and character references (Priority: P3)

**Goal**: Extract POV, tags, and character references from scene headings and link them to scenes.

**Independent Test**: Import a docx with multiple tags and POV headings and verify tags/characters are deduped and linked by id.

### Implementation for User Story 3

- [x] T017 [P] [US3] Parse POV and scene title from H4 heading text in express/src/services/importOutlineParser.ts
- [x] T018 [P] [US3] Parse tags and variants with highlight colors from H4 headings in express/src/services/importOutlineParser.ts
- [x] T019 [P] [US3] Build tag set with stable ids using normalization helpers in express/src/services/importOutlineParser.ts
- [x] T020 [P] [US3] Build character set with stable ids using normalization helpers in express/src/services/importOutlineParser.ts
- [x] T021 [US3] Link tag and character ids to scene elements in express/src/services/importOutlineParser.ts
- [x] T022 [US3] Return tags and characters in preview responses in express/src/services/importOutlineService.ts

**Checkpoint**: User Story 3 completes metadata parsing and relational linking

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T023 [P] Update quickstart response expectations in specs/027-docx-ast-conversion/quickstart.md
- [x] T024 [P] Review and update contract examples in specs/027-docx-ast-conversion/contracts/import-outline.md
- [x] T025 Verify performance and error handling notes in specs/027-docx-ast-conversion/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Within Each User Story

- Parser logic before service integration
- Core parsing before error handling integrations
- Scene metadata parsing before linking relationships

### Parallel Opportunities

- Tasks marked [P] can run in parallel (different files, no dependencies)
- After Phase 2, User Stories 1-3 can proceed in parallel if staffed

---

## Parallel Example: User Story 1

```bash
Task: "Implement heading mapping (H1 act, H2 chapter, H4 scene) in express/src/services/importOutlineParser.ts"
Task: "Map act body paragraphs to HTML content in express/src/services/importOutlineParser.ts"
Task: "Implement scene body parsing into HTML content in express/src/services/importOutlineParser.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → Validate
3. User Story 2 → Validate
4. User Story 3 → Validate
5. Polish phase updates

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks; include precise file paths and outcomes
