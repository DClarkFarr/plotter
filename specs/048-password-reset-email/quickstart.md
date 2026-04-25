# Quickstart: Forgot Password Email Flow

## Prerequisites

- MongoDB running locally
- Node.js installed
- A Gmail account with an app password enabled for SMTP use

## Environment

Set these values in `express/.env.local` or `express/.env`:

```bash
MODE=development
PORT=1000
MONGO_URL=mongodb://localhost:27017/plotter
SESSION_SECRET=change-me
SESSION_COOKIE_NAME=plotter.sid

MAILER_GMAIL_USER=your-gmail@gmail.com
MAILER_GMAIL_PASS=your-gmail-app-password
MAILER_FROM_EMAIL=your-gmail@gmail.com
MAILER_FROM_NAME=Plotter
```

## Run

```bash
cd express
npm install
npm run dev
```

## Verify

1. Submit `POST /api/auth/reset-password/request` with a known user email.
2. Confirm the API response is generic: "If the account exists, instructions have been sent."
3. Confirm the Gmail inbox receives a reset email with a code.

## Notes

- Gmail requires an app password; regular account passwords are usually rejected for SMTP.
- Keep Gmail credentials out of version control.
