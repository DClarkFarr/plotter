# Quickstart: Auth Router

## Prerequisites

- MongoDB running locally
- Node.js installed

## Environment

Set the MongoDB connection string in `.env.local` or `.env`:

```
MONGO_URL=mongodb://localhost:27017/plotter
PORT=1000
MODE=development
```

## Run

From the repository root:

```
cd express
npm install
npm run dev
```

## Verify

- Server starts on `http://localhost:1000`
- Auth endpoints available under `http://localhost:1000/api/auth`

## Notes

- If MongoDB is not running, start it locally (see [express/README.md](../../express/README.md)).
