# PlayPlusHub API Spec (MVP)

This document describes current backend behavior and expected next-phase API
direction for economy integrity.

Base URL is configured by frontend `VITE_API_URL`.

## Health

### `GET /health`

- Returns: `{ "ok": true }`

## Auth

### `POST /auth/register`

Create a new user account.

Request body:

```json
{
  "name": "Jane",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response (201):

```json
{
  "token": "....",
  "user": {
    "id": "uuid",
    "name": "Jane",
    "email": "jane@example.com",
    "coins": 0
  }
}
```

Possible errors:

- `400` invalid body fields
- `409` email already exists
- `500` server error

### `POST /auth/login`

Request body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response (200):

```json
{
  "token": "....",
  "user": {
    "id": "uuid",
    "name": "Jane",
    "email": "jane@example.com",
    "coins": 0
  }
}
```

Possible errors:

- `400` missing fields
- `401` invalid credentials
- `500` server error

### `GET /auth/me`

Auth required: `Authorization: Bearer <token>`

Response (200):

```json
{
  "user": {
    "id": "uuid",
    "name": "Jane",
    "email": "jane@example.com",
    "coins": 0
  }
}
```

Possible errors:

- `401` missing/invalid token
- `404` user not found
- `500` server error

## Guest Lifecycle

### `POST /auth/guest`

Create a new guest identity. No authentication required.

Response (201):

```json
{
  "guestToken": "...",
  "guest": {
    "id": "uuid",
    "coins": 0,
    "signupPromptCount": 0,
    "signupRequired": false
  }
}
```

Possible errors:

- `500` server error

### `GET /auth/guest`

Retrieve guest progression. Requires `X-Guest-Token` header.

Response (200):

```json
{
  "guest": {
    "id": "uuid",
    "coins": 40,
    "signupPromptCount": 2,
    "signupRequired": false
  }
}
```

Guest cadence fields:

- `signupPromptCount`: number of win-triggered prompts so far (incremented once per successful `PATCH /auth/guest` reward)
- `signupRequired`: `true` when `signupPromptCount >= 5`; guest must sign up to continue playing

Possible errors:

- `401` missing/invalid guest token
- `404` guest not found
- `410` guest has been migrated to an account
- `500` server error

### `PATCH /auth/guest`

Update guest progression (add coins). Requires `X-Guest-Token` header.

Request body:

```json
{
  "addCoins": 20
}
```

Response (200):

```json
{
  "guest": {
    "id": "uuid",
    "coins": 60,
    "signupPromptCount": 3,
    "signupRequired": false
  }
}
```

Each successful reward update increments `signupPromptCount` by 1 and sets `signupRequired=true` when count reaches 5.

Possible errors:

- `400` invalid addCoins value
- `401` missing/invalid guest token
- `404` guest not found or already migrated
- `500` server error

### `POST /auth/guest/migrate`

Migrate guest progression to an authenticated account. Requires
`Authorization: Bearer <token>` header.

Request body:

```json
{
  "guestToken": "..."
}
```

Response (200):

```json
{
  "migrationStatus": "applied",
  "coinsTransferred": 40
}
```

`migrationStatus` values:

- `applied` - coins transferred successfully
- `noop` - guest was already migrated (idempotent retry)
- `not_found` - guest record does not exist
- `invalid_token` - guest token failed verification

Possible errors:

- `400` missing/invalid guestToken in body
- `401` missing/invalid auth token
- `500` server error

## Wallet

### `POST /wallet/session/start`

Start a game session (spend coins before play). Auth required: `Authorization: Bearer <token>`

Request body:

```json
{
  "gameId": "1"
}
```

Response (200):

```json
{
  "sessionId": "uuid",
  "sessionToken": "base64payload.signature",
  "coins": 18,
  "coinCost": 2
}
```

Possible errors:

- `400` invalid gameId
- `401` unauthorized
- `404` user not found
- `422` insufficient funds (code: `INSUFFICIENT_FUNDS`, includes `coinCost`, `coins`)
- `500` server error

### `POST /wallet/session/claim`

Claim reward after game completion. Auth required. Enforces one-time claim per session.

Request body:

```json
{
  "sessionToken": "base64payload.signature",
  "outcome": {
    "levelsCompleted": 2,
    "totalLevels": 2,
    "won": true
  }
}
```

Response (200):

```json
{
  "earnedCoins": 20,
  "coins": 38
}
```

Possible errors:

- `400` invalid payload (missing sessionToken, invalid outcome shape)
- `401` invalid or expired session token
- `403` session does not belong to this user
- `409` reward already claimed (code: `DUPLICATE_CLAIM`)
- `422` invalid gameplay outcome (code: `INVALID_OUTCOME`)
- `500` server error

### `POST /wallet/reward` (deprecated)

Returns `410 Gone` with message directing clients to use session/start and session/claim instead.

## Legacy/Non-Core Endpoints

The following routes exist in code but are not core to the current PlayPlusHub
product loop:

- `/users`
- `/posts`

They are retained for MVP development history and should not be treated as the
primary game economy API surface.

## API Gaps to Close

1. Event-based progression APIs (XP, missions, streaks)
2. Guest session flow (guests currently use PATCH /auth/guest for rewards; no spend-before-play)

## Suggested Future API Domains

- `/games`: metadata, playable level definitions
- `/progress`: per-user level/XP progression
- `/economy`: spend, reward, transactions, balances
- `/avatars`: inventory, purchase, equip
- `/missions`: daily/weekly task lifecycle
- `/leaderboard`: rankings and user positioning
