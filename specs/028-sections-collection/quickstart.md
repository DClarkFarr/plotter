# Quickstart: Sections Collection

## Prerequisites

- Backend API running locally
- Frontend dev server running locally
- A story with at least one plot and existing scenes

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

1. Open a story with at least one plot and a scene at vertical index 0.
2. Create a section at vertical index 0 via UI (or API) and confirm it is stored with type `act` or `section`.
3. Verify that all scenes across plots shift upward by 1 and the section appears at index 0.
4. Create another section at an unused vertical index and confirm no scenes shift.
5. Update a section title and type and confirm updates persist after refresh.
6. Verify the sections list endpoint returns sections in ascending vertical index order.
7. Move a scene to a vertical index occupied by a section and confirm the grid shifts for both scenes and sections.
