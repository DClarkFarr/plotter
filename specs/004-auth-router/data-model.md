# Data Model: Auth Router

## Entities

### User

- **Purpose**: Represents a registered account.
- **Key Fields**:
  - `firstName`, `lastName`
  - `email` (normalized, unique)
  - `passwordHash`
  - `passwordChangedAt` (timestamp; used to invalidate sessions)
  - `createdAt`, `updatedAt`
- **Relationships**:
  - One-to-many with `Session`
  - One-to-many with `PasswordReset`

### Session

- **Purpose**: Represents an authenticated session tied to a user.
- **Key Fields**:
  - `userId`
  - `token` (unique)
  - `payload` (session metadata)
  - `expiresAt` (TTL)
  - `createdAt`, `updatedAt`
- **Relationships**:
  - Belongs to `User`
- **State Transitions**:
  - Active → Expired (TTL)
  - Active → Revoked (password reset or password change)

### PasswordReset

- **Purpose**: Track reset token lifecycle.
- **Key Fields**:
  - `userId`
  - `tokenHash`
  - `expiresAt` (1 hour TTL)
  - `usedAt` (nullable)
  - `createdAt`
- **Relationships**:
  - Belongs to `User`
- **State Transitions**:
  - Pending → Used
  - Pending → Expired

### AuthAttempt

- **Purpose**: Support throttling for login/reset.
- **Key Fields**:
  - `identifier` (email)
  - `ipAddress`
  - `type` (login | reset)
  - `type` (login | reset | signup)
  - `count`
  - `windowExpiresAt` (short TTL)
  - `createdAt`, `updatedAt`
- **State Transitions**:
  - Active → Expired (TTL)

## Validation Rules

- Emails are normalized to lowercase.
- Passwords must be 12-128 characters.
- Reset tokens are single-use and expire after 1 hour.
- Session inactivity timeout is 7 days.
