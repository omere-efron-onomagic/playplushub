# PlayPlusHub Architecture (MVP)

## System Overview

PlayPlusHub is a full-stack TypeScript application with separate frontend and
backend projects:

- `frontend/`: React + Vite SPA
- `backend/`: Express API server

Current MVP backend persistence for auth/wallet is JSON-backed. Mongo models are
present in the codebase and represent a target direction for broader data
unification.

## Frontend Architecture

### Core Stack

- React 19 + TypeScript
- React Router v7 for client routing
- Redux Toolkit for app state
- RTK Query for API calls
- Tailwind CSS for design system and UI styling

### Frontend Layers

- `ui/pages`: route-level screens
- `ui/components`: reusable page components
- `data`: static MVP game/avatar/level data
- `store/slices`: local app state
- `store/apis`: API client definitions
- `sockets`: realtime scaffold (not active in current MVP)

### Testing

- Playwright E2E tests in `frontend/tests/e2e/`. Specs: smoke-navigation, auth-flow, economy-session, guest-flow.
- Tests assume frontend (`:5173`) and backend dev servers are running.
- Auth users landing on `/play/:id` without a session token are redirected to `/game/:id` (LinkFourGame, useEffect-based).

### Current Data Behavior

- Game catalog and Link Four levels are fetched from `GET /games`, `GET /games/:gameId/levels`, `GET /games/:gameId/rounds`, and `GET /games/:gameId/rounds/:roundId/levels`.
- Round-based games (e.g. Link Four) organize levels into groups; players complete one round at a time; progression is fetched via `GET /games/:gameId/progress`.
- Auth/wallet state is synced through API + Redux.
- Guest profile behavior exists but requires fuller persistence hardening.

### Admin Panel (Frontend)

**Architecture**: Game editor registry pattern. Each game has a dedicated editor component registered by `gameId`. When an admin navigates to `/admin/games/:gameId/content`, the system loads the appropriate editor from the registry.

**Routes**:
- `/admin` → redirects to `/admin/games`
- `/admin/games` → game catalog list
- `/admin/games/:gameId/content` → game-scoped content editor (loaded from registry)
- `/admin/upload` → asset management utility (secondary)
- `/admin/levels` → legacy redirect to Link Four editor

**Registry**: `frontend/src/ui/pages/admin/gameEditorRegistry.ts` maps gameId to editor components. Editors are registered in `registerEditors.ts` on app startup.

**Editors**:
- **LinkFourEditor** (gameId `'1'`): Round/level creation with React Hook Form + Zod validation; batch image upload; inline field errors; save feedback; unsaved-change warnings
- **CinemojiEditor** (gameId `'13'`): Puzzle and hint management with tab-based UI; emoji input; category selection; mode-based hint editing

**UX Standards**: All editors use React Hook Form + Zod schemas, inline validation errors, success/error toast feedback, non-destructive save (state preserved on failure), and unsaved-change indicators.

**MVP**: Admin panel is open (no secret gate). New game types must include a registered editor component and corresponding backend endpoints.

## Backend Architecture

### Core Stack

- Node + Express + TypeScript
- Validation middleware per route group
- Custom token auth middleware

### Current Persistence

- Auth and wallet profile data: JSON-backed storage (`users.json` under `DATA_DIR`, defaults to `backend/src/data`)
- Economy: `economy_transactions.json` (append-only audit), `claimed_sessions.json` (replay protection)
- Game catalog and Link Four levels: Supabase Postgres when `CONTENT_STORE_DRIVER` is `supabase` or `dual`; otherwise JSON (`games_catalog.json`, `link_four_levels.json`). Dual mode reads from Supabase first with JSON fallback; writes go to Supabase.
- Cinemoji content (puzzles, stage hints): Supabase Postgres (`cinemoji_puzzles`, `cinemoji_stage_hints`) when driver is `supabase` or `dual`; otherwise parsed from `Cinemoji/TheGame.txt` and `Cinemoji/stages.txt`.
- Round progression: `round_progression.json` (per-actor completed rounds; migration-safe defaults when missing)
- Uploaded images: Supabase Storage when configured; otherwise local filesystem under `UPLOADS_DIR` (defaults to `backend/uploads`, served at `/uploads/`)
- Legacy/scaffold endpoints: some routes still rely on Mongo-backed models

### API Domain Groups

- `auth`: register/login/session check, guest lifecycle, guest-to-account migration
- `wallet`: session start (spend before play), session claim (server-computed reward)
- `games`: public read of catalog and levels; admin CRUD and upload (open in MVP)
- `users` and `posts`: available in code, treated as legacy/non-core for product

### Guest Persistence

- Guest records are stored in `backend/src/data/guests.json` (separate from users)
- Each guest has a signed token (90-day expiry) issued by the backend
- Client stores the guest token in localStorage and sends it via `X-Guest-Token` header
- Guest coins are server-authoritative; client does not store progression locally

## Runtime Flow (Current)

1. Frontend calls backend via `VITE_API_URL`. In dev with `VITE_API_URL` empty, Vite proxies `/uploads`, `/admin/`, `/games`, etc. to the backend for same-origin image loading.
2. Auth token (if available) is attached as Bearer header.
3. Guest token (if available) is attached as `X-Guest-Token` header.
4. Backend validates token for protected routes.
5. Wallet session flow (auth and guest): Client calls `POST /wallet/session/start` before play (with Bearer or X-Guest-Token); for round-based games, `roundId` is required. Server rejects start if the round is already completed. After game completion (both levels in round), client calls `POST /wallet/session/claim`; server verifies one-time claim, marks round complete, and applies reward.
6. Economy transactions (spend/reward) are logged append-only in `economy_transactions.json`; guest transactions include `guestId`.
7. Wallet/auth updates are persisted in JSON-backed user store.
8. Guest progression (spend, reward, cadence) is persisted via wallet session flow in JSON-backed guest store.
9. Structured logging (Winston, JSON) captures request lifecycle, economy events, startup, and errors; sensitive fields are redacted.
10. Data and upload directories can be overridden using `DATA_DIR` and `UPLOADS_DIR` for persistent production mounts.

### Guest Hydration Flow

1. On app load, if no auth user exists, frontend checks for a persisted guest token.
2. If guest token exists, frontend calls `GET /auth/guest` to restore progression.
3. If no guest token exists, frontend calls `POST /auth/guest` to create a new guest.
4. Redux state is synced with the server response, including `signupPromptCount` and
   `signupRequired` for prompt cadence gating.

### Guest Prompt Cadence Flow

1. Each successful guest reward (`POST /wallet/session/claim` with earned coins) increments `signupPromptCount` by 1.
2. Sign-up prompt cadence is evaluated **after each completed round claim**, not only after finishing all groups.
3. When `signupPromptCount >= 5`, backend sets `signupRequired=true`.
4. Frontend shows a soft sign-up prompt after each win (dismissible) when below threshold.
5. When `signupRequired` is true, frontend gates play/replay (SignupRequiredGate) and blocks
   game entry until the user signs up or logs in.

### Guest-to-Account Migration Flow

1. User completes login or registration.
2. If a guest token is present, frontend calls `POST /auth/guest/migrate` immediately
   after authentication.
3. Backend transfers guest coins to the account (additive) and marks the guest record
   as migrated.
4. Frontend clears the guest token from localStorage and updates coin balance.
5. Repeated migration attempts return `noop` (idempotent).

## Runtime Flow (Target)

1. Frontend keeps same API contract where possible.
2. Backend enforces server-side reward and spend rules.
3. Persistence migrates to unified Mongo-backed schema.
4. Product domains (games, progression, economy, missions) become first-class.

## Trust and Validation Boundaries

Implemented (session-based economy):

- Server deducts coin cost at `POST /wallet/session/start`; no play without sufficient funds.
- For round-based games: one charge per round; reward once when both levels in the round are completed; no replay of completed rounds; when all rounds are complete, further play is blocked until new rounds are added.
- Server computes rewards from authoritative game catalog and validated outcome at `POST /wallet/session/claim`.
- Client sends session token and outcome (levelsCompleted, totalLevels, won), not authoritative currency values.
- One-time claim per session; duplicate claims return 409.
- No-negative balance enforced on spend; transaction audit trail in `economy_transactions.json`.

## Non-Goals in Current MVP

- No full anti-cheat system (basic replay/duplicate-claim protection implemented)
- No production-grade analytics pipeline
- No complete ad-network integration
- No full realtime gameplay synchronization
