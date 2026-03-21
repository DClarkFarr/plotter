# Auth API Contract

## Base Path

`/api/auth`

## Endpoints

### POST /signup

**Purpose**: Create a new user and establish a session.

**Request Body**

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response 201**

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Errors**

- 400 invalid input
- 409 email already exists

### POST /login

**Purpose**: Establish a session for an existing user.

**Request Body**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Errors**

- 400 invalid input
- 401 invalid credentials (generic)

### POST /reset-password/request

**Purpose**: Request a password reset without revealing account existence.

**Request Body**

```json
{
  "email": "string"
}
```

**Response 200**

```json
{
  "message": "If the account exists, instructions have been sent."
}
```

### POST /reset-password/confirm

**Purpose**: Confirm a password reset using a token.

**Request Body**

```json
{
  "token": "string",
  "password": "string"
}
```

**Response 200**

```json
{
  "message": "Password updated"
}
```

**Errors**

- 400 invalid input
- 401 invalid or expired token

### GET /me

**Purpose**: Return the current authenticated user profile.

**Response 200**

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Errors**

- 401 unauthorized

## Cookie Requirements

- Cookie is HTTP-only.
- Cookie uses same-site protection.
- Cookie is secure in production.
- Session expires after 7 days of inactivity.
