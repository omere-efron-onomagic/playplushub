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

## Wallet

### `POST /wallet/reward`

Auth required: `Authorization: Bearer <token>`

Request body:

```json
{
  "gameId": "1",
  "rewardCoins": 20
}
```

Response (200):

```json
{
  "gameId": "1",
  "earnedCoins": 20,
  "coins": 140
}
```

Possible errors:

- `400` invalid request payload
- `401` unauthorized
- `404` user not found
- `500` server error

## Legacy/Non-Core Endpoints

The following routes exist in code but are not core to the current PlayPlusHub
product loop:

- `/users`
- `/posts`

They are retained for MVP development history and should not be treated as the
primary game economy API surface.

## API Gaps to Close

1. Server-side reward validation per game/level
2. Server-side spend validation before game start
3. Anti-duplicate reward claim logic
4. Event-based progression APIs (XP, missions, streaks)
5. Guest-to-account migration endpoint

## Suggested Future API Domains

- `/games`: metadata, playable level definitions
- `/progress`: per-user level/XP progression
- `/economy`: spend, reward, transactions, balances
- `/avatars`: inventory, purchase, equip
- `/missions`: daily/weekly task lifecycle
- `/leaderboard`: rankings and user positioning
