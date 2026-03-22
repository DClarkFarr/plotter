# Research: Web Pages — Initial Layout & Auth Forms

**Feature**: `005-web-pages-layout`
**Date**: 2026-03-21

---

## 1. Axios Client Singleton Pattern

**Decision**: Use a single exported Axios instance (`apiClient`) created once in `web/src/lib/apiClient.ts`, configured with `baseURL` from `import.meta.env.VITE_API_BASE_URL`.

**Rationale**:

- Vite exposes only env vars prefixed with `VITE_` to the client bundle via `import.meta.env`. Using `VITE_API_BASE_URL` allows switching between `http://localhost:1000` (dev), a relative path (same-origin prod build), or a full production domain without rebuilding the source.
- A singleton avoids creating a new Axios instance on every request and centralizes concerns like base URL, withCredentials, and interceptors in one place.
- `withCredentials: true` must be set globally so cookies (session) are sent cross-origin during local development.

**Alternatives considered**:

- `fetch` API directly: Rejected — no automatic credential handling, no interceptor chain, more boilerplate per call.
- Environment-specific files (`.env.development`, `.env.production`): Accepted approach; Vite loads these automatically, so the singleton just reads the already-resolved env var at module init time.

**Env file strategy**:

```
web/.env.development     → VITE_API_BASE_URL=http://localhost:1000/api
web/.env.production      → VITE_API_BASE_URL=/api          (or full URL)
```

---

## 2. Auth Endpoint Audit

**Decision**: Model the four auth endpoints as typed async functions in `web/src/api/auth.ts` backed by the Axios singleton.

Endpoints (prefix `/api/auth`):

| Method | Path                      | Request body                               | Success response          | Notes                                  |
| ------ | ------------------------- | ------------------------------------------ | ------------------------- | -------------------------------------- |
| POST   | `/signup`                 | `{ firstName, lastName, email, password }` | `201 { user: AuthUser }`  |                                        |
| POST   | `/login`                  | `{ email, password }`                      | `200 { user: AuthUser }`  |                                        |
| POST   | `/reset-password/request` | `{ email }`                                | `200 { message: string }` | Always returns success even if no user |
| POST   | `/reset-password/confirm` | `{ token, password }`                      | `200 { message: string }` | Not used in this feature's pages       |
| GET    | `/me`                     | —                                          | `200 { user: AuthUser }`  | Used to hydrate nav auth state         |

**Error response shape** (all endpoints):

```ts
{
  error: string;
}
```

Status codes: `400` (validation), `401` (credentials), `409` (email conflict), `429` (rate limited), `500` (unexpected).

**Rationale**: Typed wrappers isolate Axios from the rest of the app; hooks and components never import Axios directly.

---

## 3. Password Validation — Backend vs. Spec Alignment

**Decision**: Enforce the backend's password rules on the frontend: **12-128 characters, at least 1 uppercase letter, at least 1 special character**.

**Rationale**: The spec stated "5+ characters" but the backend's `validatePassword()` in `express/src/utils/validators.ts` enforces **12-128 characters**. Submitting a password that passes a 5-char frontend check would still fail backend validation with a 400 error. The frontend must enforce the same rules as the backend to prevent confusing submission failures.

**Rule set (enforced in `useSignUpForm`):**

- Minimum 12 characters
- Maximum 128 characters
- At least 1 uppercase letter (`/[A-Z]/`)
- At least 1 special character (`/[^a-zA-Z0-9]/`)

**Note**: The spec document should be amended to reflect 12-char minimum after this plan is reviewed.

---

## 4. Auth State Management

**Decision**: Use a Zustand store (`authStore`) for client-side auth state. TanStack Query fetches `/api/auth/me` to hydrate it.

**Rationale**:

- Auth state (logged-in user, isAuthenticated) is non-server, ephemeral session data — exactly Zustand's mandate per the constitution.
- `/api/auth/me` should be called once at app root mount via TanStack Query `useQuery`; the result populates the Zustand store.
- The `Topbar` navigation component reads from the Zustand store to decide which links to show, keeping it presentationally pure.

**Alternatives considered**:

- React context for auth: Rejected — Zustand is the mandated client state solution.
- Passing auth state as props from route loaders: Possible but creates prop drilling; Zustand store read at the component level is simpler.

---

## 5. Form Hook Pattern

**Decision**: Each form hook (`useLoginForm`, `useSignUpForm`, `useResetPasswordForm`) manages field state, touched state, validation errors, and a TanStack Query mutation. The hook returns a props object passed directly to the form component.

**Rationale**:

- Keeps form components dumb (no internal state decisions) and maximizes reusability.
- TanStack Query mutations give us `isPending`, `isError`, `error`, and `reset` for free, handling loading/error states without extra state variables.
- The success callback passed to the hook (e.g., `onLoginSuccess`) is called inside `onSuccess` of the mutation, allowing the page to decide redirect behavior.

**Hook signature pattern**:

```ts
const formProps = useLoginForm({ onLoginSuccess: () => navigate('/dashboard') })
return <LoginForm {...formProps} />
```

---

## 6. TanStack Router Route Structure

**Decision**: Follow the constitution's pattern — define route files in `web/src/routes/` that import page components from `web/src/pages/`.

**New routes needed**:

- `web/src/routes/login.tsx` → `web/src/pages/login.tsx`
- `web/src/routes/sign-up.tsx` → `web/src/pages/sign-up.tsx`
- `web/src/routes/reset-password.tsx` → `web/src/pages/reset-password.tsx`
- `web/src/routes/dashboard/index.tsx` → `web/src/pages/dashboard.tsx`

The root layout (`__root.tsx`) wraps all routes and renders the `Topbar` above the `<Outlet />`.

---

## 7. Flowbite Components to Use

| Element                | Flowbite Component                                                               |
| ---------------------- | -------------------------------------------------------------------------------- |
| Text input             | `<TextInput>`                                                                    |
| Password input         | `<TextInput type="password">`                                                    |
| Submit button          | `<Button type="submit">`                                                         |
| Field label            | `<Label>`                                                                        |
| Inline error           | `<p>` with `text-red-500` Tailwind class (Flowbite `HelperText` also acceptable) |
| Page-level error (API) | `<Alert color="failure">`                                                        |
| Navigation bar         | `<Navbar>` with `<Navbar.Brand>`, `<Navbar.Link>`                                |
| Hero / card            | Plain Tailwind layout (no dedicated hero component in Flowbite)                  |

---

## 8. Route Guard Deferral Confirmed

Route guards protecting `/dashboard` from unauthenticated access are confirmed out of scope. The `/dashboard` route renders for any visitor. A future feature will add TanStack Router `beforeLoad` guards once the auth store and `/me` endpoint hydration are verified in production.
