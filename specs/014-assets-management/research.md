# Research: Assets Management

## Upload handling

- **Decision**: Use `multer` with disk storage for character image uploads, saving files under `express/uploads/` and returning a relative URL like `/uploads/characters/<filename>`.
- **Rationale**: `multer` is the standard Express middleware for multipart uploads, fits the existing stack, and supports disk storage with filename sanitization.
- **Alternatives considered**: `busboy` (lower-level streaming API); `formidable` (more configuration overhead).

## Static asset serving

- **Decision**: Serve `express/uploads/` as a public static directory at `/uploads`.
- **Rationale**: Keeps image URLs stable across frontend and backend, and works with the requested `VITE_CDN_BASE_URL` prefix.
- **Alternatives considered**: Proxying uploads via API responses only; storing images in MongoDB (rejected for size/performance concerns).

## Character deletion constraint

- **Decision**: Treat a character as assigned if any scene references it as POV; prevent deletion when such scenes exist.
- **Rationale**: POV is the current explicit character reference in scene data, and blocking deletion avoids orphaned references.
- **Alternatives considered**: Allow deletion and null out POV automatically (rejected to avoid silent data loss).

## Frontend image URL resolution

- **Decision**: Store a relative `imageUrl` on the character (e.g., `/uploads/characters/...`) and derive a full URL using `VITE_CDN_BASE_URL` in the web app.
- **Rationale**: Supports local and production environments while keeping stored data environment-agnostic.
- **Alternatives considered**: Storing absolute URLs (rejected because it complicates environment changes).
