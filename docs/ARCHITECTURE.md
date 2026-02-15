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

- Game catalog and many page sections are static data-driven.
- Auth/wallet state is synced through API + Redux.
- Guest profile behavior exists but requires fuller persistence hardening.

## Backend Architecture

### Core Stack

- Node + Express + TypeScript
- Validation middleware per route group
- Custom token auth middleware

### Current Persistence

- Auth and wallet profile data: JSON-backed storage (`backend/src/data/users.json`)
- Economy: `economy_transactions.json` (append-only audit), `claimed_sessions.json` (replay protection)
- Game catalog: server-authoritative in `backend/src/services/economy/gameCatalog.service.ts`
- Legacy/scaffold endpoints: some routes still rely on Mongo-backed models

### API Domain Groups

- `auth`: register/login/session check, guest lifecycle, guest-to-account migration
- `wallet`: session start (spend before play), session claim (server-computed reward)
- `users` and `posts`: available in code, treated as legacy/non-core for product

### Guest Persistence

- Guest records are stored in `backend/src/data/guests.json` (separate from users)
- Each guest has a signed token (90-day expiry) issued by the backend
- Client stores the guest token in localStorage and sends it via `X-Guest-Token` header
- Guest coins are server-authoritative; client does not store progression locally

## Runtime Flow (Current)

1. Frontend calls backend via `VITE_API_URL`.
2. Auth token (if available) is attached as Bearer header.
3. Guest token (if available) is attached as `X-Guest-Token` header.
4. Backend validates token for protected routes.
5. Wallet session flow (auth and guest): Client calls `POST /wallet/session/start` before play (with Bearer or X-Guest-Token); server deducts coin cost, returns signed session token. After game completion, client calls `POST /wallet/session/claim` with token and outcome; server verifies one-time claim and computes reward from authoritative game catalog.
6. Economy transactions (spend/reward) are logged append-only in `economy_transactions.json`; guest transactions include `guestId`.
7. Wallet/auth updates are persisted in JSON-backed user store.
8. Guest progression (spend, reward, cadence) is persisted via wallet session flow in JSON-backed guest store.
9. Structured logging (Winston, JSON) captures request lifecycle, economy events, startup, and errors; sensitive fields are redacted.

### Guest Hydration Flow

1. On app load, if no auth user exists, frontend checks for a persisted guest token.
2. If guest token exists, frontend calls `GET /auth/guest` to restore progression.
3. If no guest token exists, frontend calls `POST /auth/guest` to create a new guest.
4. Redux state is synced with the server response, including `signupPromptCount` and
   `signupRequired` for prompt cadence gating.

### Guest Prompt Cadence Flow

1. Each successful guest reward (`POST /wallet/session/claim` with earned coins) increments `signupPromptCount` by 1.
2. When `signupPromptCount >= 5`, backend sets `signupRequired=true`.
3. Frontend shows a soft sign-up prompt after each win (dismissible) when below threshold.
4. When `signupRequired` is true, frontend gates play/replay (SignupRequiredGate) and blocks
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
- Server computes rewards from authoritative game catalog and validated outcome at `POST /wallet/session/claim`.
- Client sends session token and outcome (levelsCompleted, totalLevels, won), not authoritative currency values.
- One-time claim per session; duplicate claims return 409.
- No-negative balance enforced on spend; transaction audit trail in `economy_transactions.json`.

## Non-Goals in Current MVP

- No full anti-cheat system (basic replay/duplicate-claim protection implemented)
- No production-grade analytics pipeline
- No complete ad-network integration
- No full realtime gameplay synchronization
