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

Start a game session (spend coins before play). Auth required: `Authorization: Bearer <token>` **or** `X-Guest-Token` header.

Request body:

```json
{
  "gameId": "1",
  "roundId": "round-1"
}
```

- `roundId` is **required** for round-based games (games with `totalRounds`). Omit for non-round games.
- Start is rejected if the round was already completed by this user/guest (no replay).

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

- `400` invalid gameId, or missing `roundId` for round-based games
- `401` authorization or guest token required, or invalid/expired token
- `404` user or guest not found
- `422` insufficient funds (code: `INSUFFICIENT_FUNDS`, includes `coinCost`, `coins`), or round already completed (code: `ROUND_ALREADY_COMPLETED`)
- `500` server error

### `POST /wallet/session/claim`

Claim reward after game completion. Auth required: Bearer token or `X-Guest-Token`. Enforces one-time claim per session.

- For round-based games, claim succeeds only when both levels in the round are completed (`levelsCompleted === totalLevels && won`). Reward is applied once per round; the round is marked complete and cannot be replayed.
- Sign-up prompt cadence (guests) increments after each round completion, not only when all rounds are done.

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

For guest claims, response may include `signupPromptCount` and `signupRequired` for cadence sync.

Possible errors:

- `400` invalid payload (missing sessionToken, invalid outcome shape)
- `401` invalid or expired session token
- `403` session does not belong to this user or guest
- `409` reward already claimed (code: `DUPLICATE_CLAIM`)
- `422` invalid gameplay outcome (code: `INVALID_OUTCOME`)
- `500` server error

### `POST /wallet/reward` (deprecated)

Returns `410 Gone` with message directing clients to use session/start and session/claim instead.

## Games (Public)

### `GET /games`

Returns all enabled games. No auth required.

Response (200):

```json
{
  "games": [
    {
      "gameId": "1",
      "slug": "4-pics-1-word",
      "title": "4 Pics 1 Word",
      "category": "Puzzle",
      "coverImageUrl": "https://...",
      "coinCost": 2,
      "rewardCoins": 20,
      "totalLevels": 10,
      "totalRounds": 5,
      "levelsPerRound": 2,
      "enabled": true,
      "updatedAt": "2026-02-16T00:00:00.000Z",
      "rating": 4.5,
      "players": "12.3K",
      "isHot": true,
      "isPick": false
    }
  ]
}
```

### `GET /games/:gameId`

Returns a single game by id. No auth required. Returns 404 if not found or disabled. Round-based games include `totalRounds` and `levelsPerRound`.

### `GET /games/:gameId/rounds`

Returns rounds for a game (round-based games). No auth required.

Response (200):

```json
{
  "rounds": [
    { "roundId": "round-1", "levels": [] },
    { "roundId": "round-2", "levels": [] }
  ]
}
```

### `GET /games/:gameId/rounds/:roundId/levels`

Returns levels for a specific round. No auth required. Returns 404 if round not found.

Response (200):

```json
{
  "levels": [
    {
      "gameId": "1",
      "roundId": "round-1",
      "level": 1,
      "answer": "WATER",
      "images": ["url1", "url2", "url3", "url4"],
      "extraLetters": "OEYMMRB",
      "enabled": true
    }
  ]
}
```

### `GET /games/:gameId/progress`

Returns completed round IDs for the authenticated user or guest. Auth required: Bearer token or `X-Guest-Token`.

Response (200):

```json
{
  "completedRoundIds": ["round-1", "round-2"]
}
```

### `GET /games/:gameId/levels`

Returns Link Four levels for the game (flat, all rounds). No auth required.

Response (200):

```json
{
  "levels": [
    {
      "gameId": "1",
      "roundId": "round-1",
      "level": 1,
      "answer": "WATER",
      "images": ["url1", "url2", "url3", "url4"],
      "extraLetters": "OEYMMRB",
      "enabled": true
    }
  ]
}
```

## Admin (Protected)

**MVP:** Admin endpoints are open (no auth). `X-Admin-Secret` and `ADMIN_SECRET` are not used.

### `GET /admin/games`

Returns all games including disabled.

### `POST /admin/games`

Create a new game.

Request body: `gameId`, `slug`, `title`, `category`, `coverImageUrl`, `coinCost`, `rewardCoins`, optional `totalLevels`, `enabled`, `rating`, `players`, `isHot`, `isPick`.

Returns 409 if `gameId` already exists.

### `PATCH /admin/games/:gameId`

Update game metadata. Partial body allowed.

### `POST /admin/games/:gameId/levels`

Upsert levels for the game. Replaces existing levels for that game.

Request body: `{ "levels": [ { "roundId", "level", "answer", "images", "extraLetters", "enabled?" } ] }`

### `POST /admin/games/:gameId/rounds`

Create a round with levels (upload-first flow). Extra letters are auto-generated from the answer.

Request body: `{ "roundId": "round-6", "levels": [ { "answer": "WORD", "images": ["url1","url2","url3","url4"] } ] }`

### `POST /admin/uploads/images`

Upload a single image. Multipart form field name: `image`. Allowed: JPEG, PNG, WebP, max 5MB.

Response (201): `{ "url": "/uploads/filename.jpg" }`

## Cinemoji

Cinemoji is a second playable game (gameId `13`). Content is served from Supabase or static files. See [CINEMOJI.md](CINEMOJI.md) for full API:

- `GET /cinemoji/content` — mode1/mode2 stages and puzzles
- `POST /cinemoji/mode1/submit`, `POST /cinemoji/mode2/submit` — answer validation
- `POST /cinemoji/hint`, `POST /cinemoji/mode2/lives/continue` — hints and lives
- `GET /cinemoji/progress`, `POST /cinemoji/progress/complete` — stage completion

## Static Assets

### `/uploads/*`

Served statically from backend `uploads/` directory. Used for admin-uploaded game images.

## Legacy/Non-Core Endpoints

The following routes exist in code but are not core to the current PlayPlusHub
product loop:

- `/users`
- `/posts`

They are retained for MVP development history and should not be treated as the
primary game economy API surface.

## API Gaps to Close

1. Event-based progression APIs (XP, missions, streaks)

## Suggested Future API Domains

- `/games`: metadata, playable level definitions — Implemented
- `/progress`: per-user level/XP progression
- `/economy`: spend, reward, transactions, balances
- `/avatars`: inventory, purchase, equip
- `/missions`: daily/weekly task lifecycle
- `/leaderboard`: rankings and user positioning
