# Research: Import Outline Modal

## Decision 1: API endpoint shape

- **Decision**: Add a non-story-scoped endpoint `POST /api/imports/outline` that accepts `mode` (`preview` or `create`) and a .docx file via multipart form data.
- **Rationale**: The import creates a new story, so it should not require an existing story id.
- **Alternatives considered**: Story-scoped endpoints were rejected because there is no story yet.

## Decision 2: Upload handling

- **Decision**: Use multer with in-memory storage and enforce a .docx MIME type plus a size limit (match the existing 5MB upload limit).
- **Rationale**: No need to persist files yet; in-memory parsing keeps the flow simple while meeting validation requirements.
- **Alternatives considered**: Disk storage under `uploads/` with cleanup tasks. Rejected for now to avoid file lifecycle complexity.

## Decision 3: Preview and create responses

- **Decision**: Return a stub summary payload for `preview` and a stub completion payload for `create` while the parser is not implemented.
- **Rationale**: Unblocks UI integration and validates the request/response shape early.
- **Alternatives considered**: Blocking UI work until parsing is complete. Rejected to keep UX and API wiring moving.

## Decision 4: UI flow and state management

- **Decision**: Use a Flowbite modal on the dashboard, track open state in the dashboard store, and use a TanStack Query mutation for uploads.
- **Rationale**: Matches existing modal and mutation patterns and keeps the flow consistent across the app.
- **Alternatives considered**: Local component state only or a new modal system. Rejected to avoid pattern drift.
