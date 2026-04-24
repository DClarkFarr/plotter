# Implementation Plan: Import Outline Versions

**Branch**: `046-import-outline-versions` | **Date**: April 24, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/046-import-outline-versions/spec.md` plus parser design constraints from product direction.

## Summary

Implement import-versioned parsing with two independent parser methods:

- Rename the current parser to a legacy-specific parser and preserve existing behavior.
- Add a new modern parser that matches current export structure and supports round-trip import from exported `.docx` documents.
- Extend import API and UI so users choose import type (`legacy` or `modern`) before upload, with type-specific instructions/examples shown in the modal.
- Update export formatting so modern parsing can reliably detect plot and snippet structures via heading conventions.

## Technical Context

**Language/Version**: TypeScript 5.x (Express backend + React frontend)
**Primary Dependencies**: Express, multer, officeparser, docx, React, TanStack Query, Flowbite React
**Storage**: MongoDB (no schema changes planned)
**Testing**: Build + lint + manual QA with fixed `.docx` fixtures (no existing automated test harness in repo scripts)
**Target Platform**: Browser + Node.js API
**Project Type**: Web application
**Performance Goals**: Parsing latency remains within current user expectations for files up to 5 MB
**Constraints**: Preserve legacy behavior; modern parser must ingest current export output without supported-content loss
**Scale/Scope**: Import/export flow for one story per request

## Constitution Check

_GATE: Must pass before implementation and after design._

- Stack guardrails honored (Express services in `express/`, React UI in `web/`).
- Existing libraries retained; no new parser library required.
- Router remains thin; parser branching implemented in service layer.
- Input validation remains centralized at API boundary.
- No data model or database schema changes required.

## Project Structure

### Documentation (this feature)

```text
specs/046-import-outline-versions/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md
└── tasks.md (to be generated later)
```

### Source Code (planned changes)

```text
express/src/
├── routers/
│   └── importRouter.ts
├── services/
│   ├── importOutlineService.ts
│   ├── importOutlineParser.ts                  # parser dispatch + shared helpers
│   ├── importOutlineLegacyParser.ts            # renamed current parser behavior
│   ├── importOutlineModernParser.ts            # new modern parser behavior
│   └── storyExportService.ts                   # modern-export structure markers
└── types/
    └── importOutline.ts

web/src/
├── api/
│   ├── stories.ts
│   └── types.ts
└── components/dashboard/
    └── ImportOutlineModal.tsx
```

**Structure Decision**: Maintain existing backend/frontend boundaries. Add parser modules in backend service layer and keep modal behavior in frontend.

## Implementation Design

### 1) Parser Versioning and Naming

- Rename current parser method from `parseImportOutlineDocx` behavior path to `parseImportOutlineLegacyDocx`.
- Keep legacy parsing logic unchanged (scene heading parsing, inline tag token parsing, indent-based snippets) to avoid regressions.
- Introduce parser dispatch by import type:
  - `legacy` -> `parseImportOutlineLegacyDocx`
  - `modern` -> `parseImportOutlineModernDocx`
- Keep a single normalized `ImportParseResult` output contract so downstream import creation logic remains unchanged.

### 2) Modern Parser Rules

Implement a dedicated parser method aligned to modern export output.

#### 2.1 Plot marker before scene heading

- Modern parser should detect plot metadata immediately before a scene heading.
- Plot marker starts with `|` and is tied to the next scene.
- Export should emit plot marker as heading level H4 to make this boundary reliable.
- Modern parser should assert this sequence when present: `H4 plot marker` -> `scene heading`.

#### 2.2 Tags after scene heading

- Parse tags from the post-scene-heading tags row (rather than inline scene-heading tokens).
- Support current exported bracket syntax tokens (for example `[Tag]` or `[Tag:Variant]`) in that tags row.
- Associate parsed tags with the current scene and preserve tag variant/color mapping behavior where available.

#### 2.3 Snippet title + indented body

- Parse snippet title from a dedicated line immediately before snippet body, where title ends with `:`.
- Export should emit snippet title as heading level H5 (plus trailing `:` convention) for robust detection.
- Modern parser should only promote content to snippet when an H5 snippet title precedes an indented snippet block.
- If indented snippet content appears without a valid snippet title anchor, emit a warning issue and treat content as scene body fallback.

### 3) API Contract and Service Wiring

- Add `importType` to import request payload contract in frontend and backend.
- Allowed values: `legacy`, `modern`.
- Default behavior for omitted `importType`: `legacy` (backward compatibility for any older callers).
- Update route validation in `importRouter.ts` and pass the selected type into `importOutlineForStory`.
- Update `importOutlineService.ts` to call parser dispatcher based on `importType`.

### 4) Modal UX Updates

- Add import type selector at top of the import modal, above instructions.
- Update instructional copy and examples dynamically based on selected type.
- Keep selected type consistent across preview and create steps for the same file submission.
- Ensure error feedback remains clear if selected type does not match document structure.

### 5) Export Alignment for Modern Round-Trip

Update export structure so modern parser can round-trip exported files deterministically:

- Plot line emitted as H4 and still starts with `|`.
- Scene heading remains directly after plot heading.
- Tags row remains after scene heading.
- Snippet title emitted as H5 with trailing `:` immediately before snippet text block.

## Validation and Test Plan

Because repo scripts do not currently include automated test runners, validation will be executed with deterministic fixtures and manual checks.

### Backend parsing validation

- Create (or reuse) fixture docs for:
  - Legacy valid input (current accepted format)
  - Modern valid input (matching current export output)
  - Negative modern cases (missing plot marker, tags in wrong place, snippet body without H5 title)
- Verify parser outputs:
  - Element ordering and counts
  - Tag extraction and variant mapping
  - Snippet segmentation
  - Issues emitted for malformed sections

### Round-trip validation

- Export a story with plots, tags, snippets.
- Import with `modern` type and verify no supported-content loss in preview and created story.

### Regression validation

- Import existing legacy sample with `legacy` type and compare output against pre-change behavior.
- Confirm modal default + switching behavior does not break preview/create flow.

### Build/lint gates

- Run `web` lint/build and `express` TypeScript build after implementation.

## Risks and Mitigations

- Risk: Export format and parser expectations drift.
  - Mitigation: Keep modern parser rules explicitly tied to export conventions in one shared constants module.
- Risk: Legacy parser regressions during refactor/rename.
  - Mitigation: Move logic with minimal edits and add baseline fixture comparison.
- Risk: Ambiguous snippet detection from indent-only heuristics.
  - Mitigation: Require H5 snippet title anchor for modern mode.

## Task Breakdown (for tasks generation)

1. Add import type contract (`legacy`/`modern`) across web API types, API call, router validation, and service payload.
2. Extract current parser into legacy parser module and keep behavior stable.
3. Implement modern parser module with sequence-aware parsing (plot H4, scene, tags row, snippet H5 + indented body).
4. Add parser dispatcher and integrate with import service.
5. Update export service headings for plot/snippet to modern format conventions.
6. Update import modal with type selector and type-specific instructions/examples.
7. Execute fixture-based parsing verification, manual round-trip checks, and build/lint gates.

## Complexity Tracking

No constitution violations anticipated.
