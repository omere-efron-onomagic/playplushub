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
  basic wallet reward endpoint, guest mode state handling
- Partial: ad placements in UI, onboarding conversion behavior, avatar/shop/favorites/
  trending logic, mixed backend model
- Planned: full multi-game backend validation, missions, leaderboard, full economy
  enforcement, anti-cheat, full Mongo migration

See `docs/FEATURE_STATUS.md` for the full matrix.

## Docs Index

- `docs/PRODUCT_OVERVIEW.md` - purpose, audience, user scenarios, product principles
- `docs/FEATURE_STATUS.md` - status table for implemented/partial/planned features
- `docs/USER_ECONOMY.md` - current economy rules and target progression loop
- `docs/ARCHITECTURE.md` - frontend/backend architecture and data flow
- `docs/API_SPEC.md` - current API behavior + target API extensions
- `docs/ROADMAP_MVP.md` - prioritized roadmap and milestones
- `docs/USER_ECONOMNY.MD` - legacy filename retained; points to updated economy doc

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

Frontend (`frontend/.env.development`):

- `VITE_API_URL` (example: `http://localhost:3000`)

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
      data/             # static games, avatars, level data
      store/            # Redux + RTK Query
      sockets/          # socket client scaffold (not active in MVP)
  docs/
```

## Notes

- This repo intentionally contains some starter/template leftovers; see the
  status docs before treating all modules as production features.
- The documentation reflects current MVP behavior and target direction as
  approved by product inputs in this repository.
