# Data Model: Web Pages — Initial Layout & Auth Forms

**Feature**: `005-web-pages-layout`
**Date**: 2026-03-21

> This document captures frontend TypeScript types and the shape of data flowing between the API and the client. These are not database schemas — the backend models live in `express/src/models/`.

---

## API Response Types

These types mirror the JSON shapes returned by the Express auth endpoints.

### `AuthUser`

The user object returned by `/api/auth/signup`, `/api/auth/login`, and `/api/auth/me`.

```ts
// web/src/api/types.ts

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
```

**Source**: `AuthUserResponse` in `express/src/services/authService.ts`. Fields: serialized MongoDB `_id` as `id` (string), plus `email`, `firstName`, `lastName`.

---

### Response Envelopes

```ts
// web/src/api/types.ts

/** Wraps endpoints that return a user object */
export interface AuthUserResponse {
  user: AuthUser;
}

/** Wraps endpoints that return a plain message (reset-password/request, reset-password/confirm) */
export interface MessageResponse {
  message: string;
}

/** Shape of all API error responses */
export interface ApiErrorResponse {
  error: string;
}
```

---

### HTTP Error Codes (Auth Endpoints)

| Status | Meaning                 | Example trigger                                         |
| ------ | ----------------------- | ------------------------------------------------------- |
| 400    | Validation failure      | Missing field, invalid email format, password too short |
| 401    | Invalid credentials     | Wrong password on login                                 |
| 409    | Conflict                | Email already registered on sign-up                     |
| 429    | Rate limited            | Too many auth attempts                                  |
| 500    | Unexpected server error | Unhandled exception                                     |

---

## Form Field State Types

### `LoginFormFields`

```ts
// web/src/hooks/useLoginForm.ts (internal)

interface LoginFormFields {
  email: string;
  password: string;
}
```

### `SignUpFormFields`

```ts
// web/src/hooks/useSignUpForm.ts (internal)

interface SignUpFormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
```

### `ResetPasswordFormFields`

```ts
// web/src/hooks/useResetPasswordForm.ts (internal)

interface ResetPasswordFormFields {
  email: string;
}
```

---

## Auth Store State

Managed by Zustand in `web/src/store/authStore.ts`.

```ts
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}
```

**Population**: The `<Root>` layout calls `GET /api/auth/me` via TanStack Query `useQuery` on mount. On success the result populates the store. On 401 the store remains with `user: null`.

---

## Password Validation Rules

Enforced client-side in `useSignUpForm` to match backend rules in `express/src/utils/validators.ts`:

| Rule                         | Regex / Check                |
| ---------------------------- | ---------------------------- |
| Minimum 12 characters        | `value.length >= 12`         |
| Maximum 128 characters       | `value.length <= 128`        |
| At least 1 uppercase letter  | `/[A-Z]/.test(value)`        |
| At least 1 special character | `/[^a-zA-Z0-9]/.test(value)` |
