# Quickstart: Plot Header Grid Enhancements

## Prerequisites

- Node.js installed
- Backend API running locally
- `VITE_API_BASE_URL` set in the web app environment

## Run locally

```bash
cd express
npm install
npm run dev
```

```bash
cd web
npm install
npm run dev
```

## Feature entry point

- Story page: `http://localhost:5173/dashboard/story/:storyId`

## Test flow

1. Open a story page with at least one plot and one empty plot column.
2. Type in an empty plot header input and confirm the create button fades in.
3. Create the plot and confirm the header appears immediately.
4. Verify empty scene cards in the new column are enabled.
5. Hover over an existing plot header and confirm the toolbar appears.
6. Enter edit mode, change values, cancel, and confirm values revert.
7. Save updates and confirm changes persist without reloading.
8. Try to create a scene in a plotless column and confirm it is disabled.
