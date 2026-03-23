# Quickstart: Story Page Data Hookup

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

## Test data flow

1. Open the story page with a valid story id.
2. Confirm the loader appears while the story, tags, and plots load.
3. Confirm the story title and description render from API data.
4. Click the edit icon, update the title/description, and save.
5. Confirm the heading returns to view mode with updated values.
