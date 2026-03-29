# Quickstart: Soft Delete Scene

## Prerequisites

- Node.js dependencies installed for `express/` and `web/`.

## Local Development

1. Start the API server:

```bash
cd express
npm run dev
```

2. Start the web app:

```bash
cd web
npm run dev
```

## Manual Verification

- Open a story and select a scene to open the sidebar.
- In the delete section, click the destructive delete button and confirm the modal prompt.
- Verify the sidebar closes, the selection clears, and the scene disappears from the grid.
- Cancel the modal and confirm the scene remains unchanged.
- Simulate a failed delete (server error) and confirm an error alert is shown while the scene remains visible.
