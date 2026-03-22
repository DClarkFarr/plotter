# Quickstart: Web Pages — Initial Layout & Auth Forms

**Feature**: `005-web-pages-layout`
**Date**: 2026-03-21

---

## Prerequisites

- Node.js ≥ 20
- The Express API running locally on port `1000` (or whatever `PORT` is set to in `express/.env`)
- MongoDB running (required by the Express server)

---

## Environment Setup

Create `web/.env.development` (git-ignored):

```env
VITE_API_BASE_URL=http://localhost:1000/api
```

For a production build, set `VITE_API_BASE_URL` in your CI/deployment environment or `web/.env.production`:

```env
VITE_API_BASE_URL=/api
```

> Vite automatically loads `.env.development` in `vite dev` mode and `.env.production` for `vite build`. The `VITE_` prefix is required — Vite strips all other env vars from the client bundle.

---

## Install New Dependencies

```bash
cd web
npm install axios
```

---

## Running the Dev Server

```bash
# Terminal 1 — API
cd express && npm run dev

# Terminal 2 — Web
cd web && npm run dev
```

The web app will be available at `http://localhost:5173` (or the next available Vite port).

---

## Key Files Created by This Feature

```text
web/
├── .env.development                      # VITE_API_BASE_URL (git-ignored)
├── src/
│   ├── lib/
│   │   └── apiClient.ts                  # Axios singleton, reads VITE_API_BASE_URL
│   ├── api/
│   │   ├── types.ts                      # AuthUser, response envelopes, ApiError
│   │   └── auth.ts                       # Typed wrappers for /api/auth/* endpoints
│   ├── store/
│   │   └── authStore.ts                  # Zustand: { user, isAuthenticated, setUser, clearUser }
│   ├── components/
│   │   ├── layout/
│   │   │   └── Topbar.tsx                # Nav: logo left, auth links right
│   │   └── forms/
│   │       ├── LoginForm.tsx             # Prop-driven login form (Flowbite)
│   │       ├── SignUpForm.tsx            # Prop-driven sign-up form (Flowbite)
│   │       └── ResetPasswordForm.tsx     # Prop-driven reset-password form (Flowbite)
│   ├── hooks/
│   │   ├── useLoginForm.ts               # Field state + TanStack mutation + validation
│   │   ├── useSignUpForm.ts              # Field state + TanStack mutation + validation
│   │   └── useResetPasswordForm.ts       # Field state + TanStack mutation + validation
│   ├── pages/
│   │   ├── home.tsx                      # Landing page (banner + CTA)
│   │   ├── dashboard.tsx                 # Placeholder "Welcome to Dashboard"
│   │   ├── login.tsx                     # Composes useLoginForm + <LoginForm>
│   │   ├── sign-up.tsx                   # Composes useSignUpForm + <SignUpForm>
│   │   └── reset-password.tsx            # Composes useResetPasswordForm + <ResetPasswordForm>
│   └── routes/
│       ├── __root.tsx                    # Root layout: <Topbar> + <Outlet>
│       ├── index.tsx                     # Route for /
│       ├── login.tsx                     # Route for /login
│       ├── sign-up.tsx                   # Route for /sign-up
│       ├── reset-password.tsx            # Route for /reset-password
│       └── dashboard/
│           └── index.tsx                 # Route for /dashboard
```

---

## How Auth State Works

1. `__root.tsx` calls `GET /api/auth/me` via TanStack Query (`useQuery`) on mount.
2. On success: `authStore.setUser(user)` populates `isAuthenticated: true`.
3. On 401: store stays `user: null, isAuthenticated: false`.
4. `Topbar` reads from the auth store to show the correct nav links.
5. On logout: the logout mutation calls `POST /api/auth/logout` (future feature), then `authStore.clearUser()`.

---

## API Client Usage

```ts
import { apiClient } from "~/lib/apiClient";

// The base URL is already set — just use relative paths:
const response = await apiClient.post("/auth/login", { email, password });
```

---

## Form Hook Usage

```ts
// In a page component:
import { useLoginForm } from '~/hooks/useLoginForm';
import { LoginForm } from '~/components/forms/LoginForm';
import { useNavigate } from '@tanstack/react-router';

export function LoginPage() {
  const navigate = useNavigate();
  const formProps = useLoginForm({
    onLoginSuccess: () => navigate({ to: '/dashboard' }),
  });
  return <LoginForm {...formProps} />;
}
```
