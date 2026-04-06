# Quickstart: Docx AST Conversion

## Prerequisites

- Node.js and npm installed
- MongoDB configured (local or remote)
- Docx file that follows the heading/tag conventions

## Run the API

1. Install dependencies in the backend:

```bash
cd express
npm install
```

2. Start the server:

```bash
npm run dev
```

## Try a preview import

```bash
curl -X POST "http://localhost:3000/api/imports/outline" \
  -F "file=@/path/to/outline.docx" \
  -F "mode=preview" \
  -F "storyName=Imported Outline"
```

Expected response includes `mode`, `summary`, parsed `elements`, `tags`, `characters`, and any `issues`.

## Create a story from import

```bash
curl -X POST "http://localhost:3000/api/imports/outline" \
  -F "file=@/path/to/outline.docx" \
  -F "mode=create"
```

Expected response includes `storyId` and `message` along with the parsed summary. If parsing issues are errors, the API responds with `422` and returns the preview payload plus `issues`.
