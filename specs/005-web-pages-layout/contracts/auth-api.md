# Auth API Contract

**Feature**: `005-web-pages-layout`
**Base path**: `/api/auth`
**Date**: 2026-03-21

> This contract is derived from `express/src/routers/authRouter.ts` and `express/src/services/authService.ts`.
> It is the authoritative reference for the frontend API layer in `web/src/api/auth.ts`.

---

## Shared Types

### `AuthUser`

```ts
{
  id: string; // serialized MongoDB ObjectId
  email: string;
  firstName: string;
  lastName: string;
}
```

### Error Response (all error status codes)

```ts
{
  error: string;
}
```

---

## Endpoints

### POST `/api/auth/signup`

Register a new account and start a session.

**Request**

```ts
{
  firstName: string; // required, max 80 chars
  lastName: string; // required, max 80 chars
  email: string; // required, valid email format
  password: string; // required, 12–128 chars
}
```

**Success** `201`

```ts
{
  user: AuthUser;
}
```

**Errors**

| Status | `error` value                                                     | Cause                            |
| ------ | ----------------------------------------------------------------- | -------------------------------- |
| 400    | `"firstName is required"`                                         | Missing or blank firstName       |
| 400    | `"lastName is required"`                                          | Missing or blank lastName        |
| 400    | `"email is required"` / `"Invalid email"`                         | Missing or malformed email       |
| 400    | `"password is required"` / `"Password must be 12-128 characters"` | Missing or out-of-range password |
| 409    | `"Email already in use"`                                          | Email already registered         |
| 429    | `"Too many attempts…"`                                            | Rate limit exceeded              |
| 500    | `"Unexpected error"`                                              | Unhandled server exception       |

---

### POST `/api/auth/login`

Authenticate and start a session.

**Request**

```ts
{
  email: string; // required, valid email format
  password: string; // required, 12–128 chars
}
```

**Success** `200`

```ts
{
  user: AuthUser;
}
```

**Errors**

| Status | `error` value                                                     | Cause                            |
| ------ | ----------------------------------------------------------------- | -------------------------------- |
| 400    | `"email is required"` / `"Invalid email"`                         | Missing or malformed email       |
| 400    | `"password is required"` / `"Password must be 12-128 characters"` | Missing or out-of-range password |
| 401    | `"Invalid credentials"`                                           | Wrong email or password          |
| 429    | `"Too many attempts…"`                                            | Rate limit exceeded              |
| 500    | `"Unexpected error"`                                              | Unhandled server exception       |

---

### POST `/api/auth/reset-password/request`

Trigger a password reset email. **Always returns 200** regardless of whether the email exists (prevents email enumeration).

**Request**

```ts
{
  email: string;
}
```

**Success** `200`

```ts
{
  message: "If the account exists, instructions have been sent.";
}
```

**Errors**

| Status | `error` value                             | Cause                      |
| ------ | ----------------------------------------- | -------------------------- |
| 400    | `"email is required"` / `"Invalid email"` | Missing or malformed email |
| 429    | `"Too many attempts…"`                    | Rate limit exceeded        |
| 500    | `"Unexpected error"`                      | Unhandled server exception |

---

### POST `/api/auth/reset-password/confirm`

Complete the password reset using a token from the reset email.

> **Out of scope for this feature** — no UI page is built for this endpoint here.

**Request**

```ts
{
  token: string; // reset token from email link
  password: string; // new password, 12–128 chars
}
```

**Success** `200`

```ts
{
  message: "Password updated";
}
```

---

### GET `/api/auth/me`

Return the currently authenticated user. Used to hydrate auth state on page load.

**Request**: none (reads session cookie)

**Success** `200`

```ts
{
  user: AuthUser;
}
```

**Errors**

| Status | `error` value         | Cause                      |
| ------ | --------------------- | -------------------------- |
| 401    | `"Not authenticated"` | No active session          |
| 500    | `"Unexpected error"`  | Unhandled server exception |

---

## Client-Side Error Handling Strategy

All API functions wrap the Axios call and re-throw a structured `ApiError`:

```ts
class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly serverMessage: string,
  ) {
    super(serverMessage);
  }
}
```

- **Axios network errors** (no response): throw `ApiError` with `status: 0` and message `"Network error"`.
- **Axios HTTP errors** (response received): extract `response.data.error` and throw `ApiError` with the actual HTTP status.
- Hooks catch `ApiError` and map it to user-visible error messages.
- 429 Too Many Requests: display `"Too many attempts. Please try again later."`
- 409 Conflict (sign-up): display `"An account with this email already exists."`
- 401 (login): display `"Invalid email or password."`
- 500 / unknown: display `"Something went wrong. Please try again."`
