# Quickstart

## Goal

Provide MongoDB models with CRUD-only helpers and domain services that orchestrate multi-collection workflows.

## Run Backend Locally

1. Install dependencies in `express/`.
2. Ensure MongoDB connection settings are configured (see `express/src/utils/env.ts`).
3. Start the API server with `npm run dev`.

## Validate Data Layer

- Create a user and verify unique email enforcement.
- Create a story with an owner permission, then create a plot and scene under it.
- Create a session with a token and confirm it expires after `expiresAt`.
- Run the model import check to confirm no model-to-model imports remain.
