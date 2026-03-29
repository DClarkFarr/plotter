# Research: Soft Delete Scene

## Soft delete data shape

- **Decision**: Use a nullable `deletedAt` timestamp on scenes and treat missing or null values as active.
- **Rationale**: Preserves existing data without a migration and allows future restore flows with minimal change.
- **Alternatives considered**: Boolean `isDeleted` flag (rejected because timestamps are more descriptive and align with audit needs).

## Scene indexing strategy

- **Decision**: Make the `{ plotId, verticalIndex }` unique index partial to only apply to active scenes (`deletedAt` missing or null).
- **Rationale**: Prevents soft-deleted scenes from blocking new scenes at the same vertical index.
- **Alternatives considered**: Removing the unique index entirely (rejected because it protects ordering integrity).

## API surface for deletion

- **Decision**: Add a dedicated delete endpoint that performs a soft delete and returns `204` on success.
- **Rationale**: Aligns with existing REST patterns used for tag/character deletion while keeping scene updates distinct from deletion.
- **Alternatives considered**: Reusing PATCH with a `deletedAt` payload (rejected to keep delete intent explicit).

## UI confirmation pattern

- **Decision**: Use Flowbite `Modal` with `ModalBody` (not `Modal.Body`) for confirmation, themed with a destructive warning message.
- **Rationale**: Matches UI library constraints and provides clear affordance for destructive actions.
- **Alternatives considered**: Inline confirmation text only (rejected because it is easier to misclick).
