# Tasks: Modern Import Syntax Guide

**Input**: Design documents from `/specs/050-import-syntax-guide/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths relative to repository root

---

## Phase 1: Foundational — Remove the inline modern instructions fragment

Replace the existing inline `<>` fragment (the two-bullet `space-y-2` divs) with a single
`<ModernImportInstructions />` call, and add the stub component so the file still compiles.

- [x] T001 In `web/src/components/dashboard/ImportOutlineModal.tsx`, replace the inline `<>` fragment rendered when `importType !== "legacy"` with `<ModernImportInstructions />`, and add an empty stub `const ModernImportInstructions = () => <div />;` near `LegacyImportInstructions` so TypeScript compiles

---

## Phase 2: User Story 1 — Full syntax reference (Document Structure, POV, Plots, Tags)

**Story goal**: Writer can open the modern instructions and read a full, accurate reference for
all constructs except snippets — acts, chapters, scenes (with and without POV), plots (both
forms), and the tag row — each with a description and dark example block.

**Independent test**: Open the Import Outline modal, select Modern outline, and confirm all
five sections are present with correct examples as described in quickstart.md Tests 1–2d.

- [x] T002 [US1] In `web/src/components/dashboard/ImportOutlineModal.tsx`, replace the `ModernImportInstructions` stub with the real component root: `<div className="text-sm text-slate-600">` containing the "Document Structure" section — `<h1>` title, two-column layout, left description (H1=act, H2=chapter, H3=scene), right dark block showing `(H1)`, `(H2)`, `| Main Journey`, and `(H3)` example lines
- [x] T003 [P] [US1] In `web/src/components/dashboard/ImportOutlineModal.tsx`, add the "Scene POV Character" section to `ModernImportInstructions`: left describes the optional `Character Name: Scene Title` H3 prefix and shows the syntax tokens; right dark block shows a POV scene example and a bare scene example
- [x] T004 [P] [US1] In `web/src/components/dashboard/ImportOutlineModal.tsx`, add the "Plots" section to `ModernImportInstructions`: left describes both accepted forms (H4 heading and `| PlotName` paragraph prefix), states each scene belongs to one plot, adds color tip; right dark block shows both forms in sequence (`| Main Journey` paragraph → scene, then `(H4) | Villain Arc` heading → scene)
- [x] T005 [P] [US1] In `web/src/components/dashboard/ImportOutlineModal.tsx`, add the "Scene Tags" section to `ModernImportInstructions`: left describes that the first paragraph after the scene heading is the tag row, explains basic `[Tag]` and variant `[Tag:Variant]` syntax, lists multi-tag support, adds color tip; right has three separate dark blocks — basic tag, variant tag, and multi-tag row examples

---

## Phase 3: User Story 2 — Snippet indentation rules

**Story goal**: Writer can read a clear explanation of how indented paragraphs become
snippets, what the minimum indentation is (~1 cm), and how snippet headings (H5 or
colon-suffix) work, with a concrete example.

**Independent test**: Open the modal on Modern outline and verify the Snippets section
is present with the indentation threshold stated and an example showing a labelled snippet
block inside a scene (quickstart.md Test 2e).

- [x] T006 [US2] In `web/src/components/dashboard/ImportOutlineModal.tsx`, add the "Snippets" section to `ModernImportInstructions`: left explains that paragraphs indented ≥ ~1 cm become snippet content, describes the H5 or colon-suffix heading option, and notes that unlabelled indented blocks are auto-grouped; right dark block shows a scene heading + tag row, then a `(H5) Draft:` snippet heading followed by indented dialog lines, then a non-indented paragraph back in the scene body

---

## Phase 4: User Story 3 — Color convention notes

**Story goal**: Writer can find the one-line color notes in the Plots and Tags sections so
they know that coloring a `|` or `[Tag]` token in the source document carries the color
through on import.

**Independent test**: Color tip sentences are visible in both the Plots and Tags sections
(quickstart.md Tests 2c and 2d color notes).

> **Note**: Color tip sentences are authored as part of T004 (Plots section) and T005
> (Tags section). This phase has no additional implementation tasks — the acceptance
> criteria for US3 are satisfied by the content added in Phase 2.

_(No additional tasks — color notes are already included in T004 and T005.)_

---

## Final Phase: Polish & Validation

- [x] T007 [P] Run `cd web && npm run build` and confirm zero TypeScript and lint errors after all component sections are added to `ImportOutlineModal.tsx`
- [x] T008 [P] Visually review the component against quickstart.md Tests 1–4: open the modal, switch between Modern and Legacy, confirm all five sections render and Legacy instructions are unchanged

---

## Dependency Graph

```
T001 (stub + wiring)
  └── T002 (Document Structure section — fills stub)
        ├── T003 [P] (POV section)
        ├── T004 [P] (Plots section — US1 + US3 color note)
        └── T005 [P] (Tags section — US1 + US3 color note)
              └── T006 (Snippets section — US2)
                    └── T007 [P] (build check)
                    └── T008 [P] (visual review)
```

T003, T004, T005 can all be written in parallel once T002 establishes the component
root structure. T006 depends only on the component existing, so it can follow any of
T003–T005.

---

## Parallel Execution Examples

**Parallel group after T002**:

- T003 (POV section) — adds one JSX section block
- T004 (Plots section) — adds one JSX section block
- T005 (Tags section) — adds one JSX section block, three example blocks

**Parallel final validation** (after T006):

- T007 build check
- T008 visual review

---

## Implementation Strategy

**MVP scope (US1 only)**: Complete T001–T005 and T007. This gives the user the full
reference for structure, POV, plots, and tags — the most commonly needed constructs.

**Full delivery**: Add T006 for the Snippets section (US2). US3 color notes are already
embedded in T004 and T005.

**Suggested order**: T001 → T002 → T003 + T004 + T005 (parallel) → T006 → T007 + T008

---

## Task Count Summary

| Phase                                                  | Tasks                      | User Story |
| ------------------------------------------------------ | -------------------------- | ---------- |
| Phase 1 — Foundational                                 | 1 (T001)                   | —          |
| Phase 2 — Full reference (structure, POV, plots, tags) | 4 (T002–T005)              | US1        |
| Phase 3 — Snippets                                     | 1 (T006)                   | US2        |
| Phase 4 — Color notes                                  | 0 (included in T004, T005) | US3        |
| Final — Polish & validation                            | 2 (T007–T008)              | —          |
| **Total**                                              | **8**                      |            |

**Format validation**: All tasks use `- [ ] T### [P?] [US?] Description with file path` ✅
