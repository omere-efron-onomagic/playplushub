# PlayPlusHub

PlayPlusHub is a hackathon MVP for a game hub designed like a vending machine.
The product focus is short-session mind games (puzzles, trivia, thinking games)
with a progression loop based on coins, XP, avatar upgrades, and ads.

The brand is currently "PlayPlusHub" and may change later.

## Product Snapshot

- Format: multi-game platform (currently one fully playable game)
- Audience focus: 30+ users, mainly women
- Use case: quick entertainment during travel or short idle moments
- Goal: convert anonymous players to signed-in users through soft prompts

## Current MVP Scope

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Persistence: simple JSON-backed user storage for MVP auth/wallet flows
- Data model direction: migrate to full Mongo-backed persistence in a next phase

## Implemented vs Planned

- Implemented (MVP quality): UI shell, game catalog pages, login/signup, one game,
  basic wallet reward endpoint, guest mode state handling, admin panel (games/levels/upload),
  dynamic game catalog and Link Four levels from API, E2E regression tests (Playwright),
  grouped rounds (5 rounds × 2 levels), no-replay completion gating, round progression,
  admin upload-first level creation (4 images + answer, auto extra letters)
- Partial: ad placements in UI, onboarding conversion behavior, avatar/shop/favorites/
  trending logic, mixed backend model. Sign-up prompt cadence evaluates after each round completion.
- Planned: full multi-game backend validation, missions, leaderboard, full economy
  enforcement, anti-cheat, full Mongo migration

See `docs/FEATURE_STATUS.md` for the full matrix.

**Logging**: Backend uses Winston for JSON structured logs. Default level is `debug`; set `LOG_LEVEL` to control verbosity. Passwords and tokens are redacted in logs.

**Round-based progression (Link Four)**: Levels are grouped into rounds (e.g. 5 rounds × 2 levels). Players spend once per round to play and receive a reward when both levels in that round are completed. Completed rounds cannot be replayed; when all rounds are done, play is blocked until new rounds are added.

**Admin authoring flow**: Create rounds via the admin panel by uploading 4 images per level (drop, select, or paste) and entering only the answer; extra letters are auto-generated server-side. **Adding a new game type must include admin panel functionality** (content management and uploads for that game)—see `docs/DEVELOPER_ONBOARDING.md` and `.cursor/rules/00-product-scope.mdc`.

## Docs Index

- `docs/PRODUCT_OVERVIEW.md` - purpose, audience, user scenarios, product principles
- `docs/FEATURE_STATUS.md` - status table for implemented/partial/planned features
- `docs/USER_ECONOMY.md` - current economy rules and target progression loop
- `docs/ARCHITECTURE.md` - frontend/backend architecture and data flow
- `docs/API_SPEC.md` - current API behavior + target API extensions
- `docs/ROADMAP_MVP.md` - prioritized roadmap and milestones
- `docs/USER_ECONOMNY.MD` - legacy filename retained; points to updated economy doc
- `docs/DEVELOPER_ONBOARDING.md` - shared Cursor workflow, rules, skills, worktrees, and team best practices
- `docs/ADDING_NEW_GAME.md` - checklist for adding a new game type (admin panel required)
- `docs/TEST_SCENARIOS.md` - backend unit tests and integration/E2E test scenarios

## Local Setup

Install dependencies in both projects:

```bash
cd backend && npm i
cd ../frontend && npm i
```

## Environment Variables

Backend (`backend/.env`):

- `PORT` (default `3000`)
- `FRONTEND_URL` (comma-separated allowed origins)
- `MONGODB_URI` (optional in current MVP; server can run JSON-backed auth flows)
- `AUTH_SECRET` (recommended for non-default token signing)
- `ADMIN_SECRET` (optional; min 8 chars for admin panel at `/admin`; image upload, game/level CRUD)
- `LOG_LEVEL` (optional; default `debug` for verbose logs; use `info`, `warn`, or `error` to reduce output)

Frontend (`frontend/.env.development`):

- `VITE_API_URL` — leave empty for dev (API and uploads go through Vite proxy for same-origin); or `http://localhost:3000` for direct backend

## E2E Testing

With backend and frontend running, from `frontend/`:

```bash
npx playwright install   # first time only
npm run test:e2e
```

See `frontend/README.md` for full E2E commands and troubleshooting.

## Run (if you are starting locally)

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Repository Structure

```text
playplushub/
  backend/
    src/
      controllers/      # auth, wallet, users, posts
      middleware/       # auth middleware
      routes/           # API route registration
      services/         # JSON-backed user store
      validators/       # request validation
      models/           # mongo models (partial usage)
      data/users.json   # MVP persistence file for auth/wallet
  frontend/
    src/
      ui/pages/         # app pages
      ui/components/    # shared page components
      data/             # static categories; games/levels from API
      store/            # Redux + RTK Query
      sockets/          # socket client scaffold (not active in MVP)
  docs/
```

## Notes

- This repo intentionally contains some starter/template leftovers; see the
  status docs before treating all modules as production features.
- The documentation reflects current MVP behavior and target direction as
  approved by product inputs in this repository.
