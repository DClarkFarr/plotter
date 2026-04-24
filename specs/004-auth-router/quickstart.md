# Quickstart: Auth Router

## Prerequisites

- MongoDB running locally
- Node.js installed

## Environment

Set MongoDB in `.env.local` or `.env` using either a full URL or split credentials:

```
MONGO_URL=mongodb://localhost:27017/plotter
PORT=1000
MODE=development
SESSION_SECRET=change-me
SESSION_COOKIE_NAME=plotter.sid

# OR
MONGO_USER=your_username
MONGO_DB=plotter
MONGO_PW=your_password
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
