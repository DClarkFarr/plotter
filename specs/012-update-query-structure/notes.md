# Query Documentation Refresh Notes

## Tracking List: Specs To Review

- [x] specs/001-story-plotting-dashboard/spec.md - no query/mutation references
- [x] specs/002-database-structure/spec.md - no query/mutation references
- [x] specs/004-auth-router/spec.md - no query/mutation references
- [x] specs/005-web-pages-layout/spec.md - no query/mutation references
- [x] specs/006-dashboard-ui/spec.md - no query/mutation references
- [x] specs/007-story-page-data/spec.md - updated data access wording
- [x] specs/008-plot-header-grid/spec.md - updated data access wording
- [x] specs/009-plot-row-color/spec.md - no query/mutation references
- [x] specs/010-create-scene-flow/spec.md - no query/mutation references
- [x] specs/011-scene-pov/spec.md - no query/mutation references

## Terminology Reference (Use Consistently In Specs)

- Query: A read operation that retrieves data for the UI or workflows.
- Mutation: A write operation that changes server-side state.
- Query key: A stable identifier used to group, cache, and invalidate related queries.

## Standard Pattern Description (Use In Relevant Specs)

Queries and mutations are organized by model. Each model has a dedicated query grouping so contributors can find read and write operations in a consistent place. Query keys are defined as helper methods to keep naming consistent and to prevent key drift across the codebase.

## Audit Notes

- Deprecated reference search term: deprecated story hook file
- Replace deprecated references with descriptive wording, not new file names.

### Audit Results

- Deprecated file name search (useStory.ts): 0 matches in specs/
- Updated files:
  - specs/007-story-page-data/spec.md
  - specs/008-plot-header-grid/spec.md
  - specs/007-story-page-data/tasks.md
  - specs/008-plot-header-grid/tasks.md
  - specs/010-create-scene-flow/tasks.md
  - specs/011-scene-pov/tasks.md
  - specs/012-update-query-structure/spec.md
  - specs/012-update-query-structure/notes.md
