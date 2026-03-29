# Quickstart: Assets Management

## Prerequisites

- Node.js dependencies installed for `express/` and `web/`.
- Environment variable `VITE_CDN_BASE_URL` set in `web/.env`.

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

3. Set local CDN base URL:

```bash
# web/.env
VITE_CDN_BASE_URL=http://localhost:4000
```

4. In the Portal, open the Assets menu and select characters or tags to access the sidebar views.

## Manual Verification

- Rename a tag in the manage tags list and confirm the new name persists on refresh.
- Edit a character name/description inline and confirm the list updates.
- Upload a character image and confirm it loads via `VITE_CDN_BASE_URL`.
- Attempt to delete a character assigned as a scene POV and confirm deletion is blocked with a clear message.
