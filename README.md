# PlayPlusHub

PlayPlusHub is a hackathon MVP for a game hub designed like a vending machine.
The product focus is short-session mind games (puzzles, trivia, thinking games)
with a progression loop based on coins, XP, avatar upgrades, and ads.

The brand is currently "PlayPlusHub" and may change later.

## Product Snapshot

- Format: multi-game platform (currently two fully playable games: Link Four and Cinemoji)
- Audience focus: 30+ users, mainly women
- Use case: quick entertainment during travel or short idle moments
- Goal: convert anonymous players to signed-in users through soft prompts

## Current MVP Scope

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Persistence: Supabase (Postgres + Storage) for game content and assets; JSON-backed auth/wallet flows
- Data model direction: migrate to full Mongo-backed persistence in a next phase

## Implemented vs Planned

- Implemented (MVP quality): UI shell, game catalog pages, login/signup, two playable games
  (Link Four with grouped rounds, Cinemoji with 2 modes and staged progression), basic wallet
  reward endpoint, guest mode state handling, admin panel (games/levels/upload), dynamic game
  catalog from API, Supabase-backed game content with dual-read fallback, E2E regression tests
  (Playwright), grouped rounds (5 rounds × 2 levels), no-replay completion gating, round progression,
  admin upload-first level creation (4 images + answer, auto extra letters)
- Partial: ad placements in UI (including Cinemoji rewarded hint placeholder), onboarding conversion
  behavior, avatar/shop/favorites/trending logic, mixed backend model. Sign-up prompt cadence
  evaluates after each round completion.
- Planned: full multi-game backend validation, missions, leaderboard, full economy
  enforcement enhancements, full Mongo migration

See `docs/FEATURE_STATUS.md` for the full matrix.

**Logging**: Backend uses Winston for JSON structured logs. Default level is `debug`; set `LOG_LEVEL` to control verbosity. Passwords and tokens are redacted in logs.

**Round-based progression (Link Four)**: Levels are grouped into rounds (e.g. 5 rounds × 2 levels). Players spend once per round to play and receive a reward when both levels in that round are completed. Completed rounds cannot be replayed; when all rounds are done, play is blocked until new rounds are added.

**Staged progression (Cinemoji)**: 40 emoji-based movie puzzles across 2 gameplay modes with hints, lives, and mobile-friendly keyboard/drag input. Content stored in Supabase with file fallback.

**Admin authoring flow**: Create Link Four rounds via the admin panel by uploading 4 images per level (drop, select, or paste) and entering only the answer; extra letters are auto-generated server-side. Cinemoji content is managed via Supabase (puzzles and hints tables) with migration scripts. **Adding a new game type must include admin panel functionality** (content management and uploads for that game)—see `docs/DEVELOPER_ONBOARDING.md`, `docs/ADDING_NEW_GAME.md`, and `.cursor/rules/00-product-scope.mdc`.

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
- `docs/DEPLOYMENT_CICD.md` - GitHub Actions + Vercel/Render deployment runbook
- `docs/SUPABASE_SETUP.md` - Supabase Postgres + Storage setup (production game data and images)

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
- `DATA_DIR` (optional; overrides JSON persistence directory)
- `UPLOADS_DIR` (optional; overrides uploaded images directory)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` (optional; for Supabase Postgres + Storage)
- `CONTENT_STORE_DRIVER` (optional; `json` | `supabase` | `dual`; default `json`)

See `docs/SUPABASE_SETUP.md` for production storage migration.

Frontend (`frontend/.env.development`):

- `VITE_API_URL` — leave empty for dev (API and uploads go through Vite proxy for same-origin); or `http://localhost:3000` for direct backend

## E2E Testing

With backend and frontend running, from `frontend/`:

```bash
npx playwright install   # first time only
npm run test:e2e
```

See `frontend/README.md` for full E2E commands and troubleshooting.

## CI/CD (main branch)

- GitHub Actions workflow: `.github/workflows/ci.yml`
- On PR/push to `main`, it runs:
  - `backend`: `npm run typecheck`
  - `frontend`: `npm run typecheck`
- Deployment on merge/push to `main` is handled by:
  - Vercel (frontend)
  - Render (backend)

Full setup: `docs/DEPLOYMENT_CICD.md`.

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
      controllers/      # auth, wallet, games, admin, cinemoji
      middleware/       # auth middleware
      routes/           # API route registration
      services/         # user store (JSON), game content (Supabase/JSON dual-read)
      repositories/     # Supabase + JSON repositories for content
      validators/       # request validation
      models/           # mongo models (partial usage)
      scripts/          # migration scripts (JSON->Supabase, uploads->Storage, Cinemoji)
      data/             # JSON fallback files: users, guests, games_catalog, link_four_levels, cinemoji_progress
    supabase-schema.sql # Schema reference (games, link_four_levels, cinemoji_puzzles, cinemoji_stage_hints)
  frontend/
    src/
      ui/pages/         # app pages (Home, CinemojiGame, PlayGamePage, admin)
      ui/components/    # shared page components
      data/             # static categories; games/levels from API
      store/            # Redux + RTK Query (gamesApi, adminApi, cinemojiApi)
      sockets/          # socket client scaffold (not active in MVP)
  supabase/
    migrations/         # Supabase schema migrations
  Cinemoji/            # Static Cinemoji content files (fallback when CONTENT_STORE_DRIVER=json)
  docs/
```

## Notes

- This repo intentionally contains some starter/template leftovers; see the
  status docs before treating all modules as production features.
- The documentation reflects current MVP behavior and target direction as
  approved by product inputs in this repository.
