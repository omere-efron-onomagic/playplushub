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
- Legacy/scaffold endpoints: some routes still rely on Mongo-backed models

### API Domain Groups

- `auth`: register/login/session check
- `wallet`: reward updates
- `users` and `posts`: available in code, treated as legacy/non-core for product

## Runtime Flow (Current)

1. Frontend calls backend via `VITE_API_URL`.
2. Auth token (if available) is attached as Bearer header.
3. Backend validates token for protected routes.
4. Wallet/auth updates are persisted in JSON-backed user store.

## Runtime Flow (Target)

1. Frontend keeps same API contract where possible.
2. Backend enforces server-side reward and spend rules.
3. Persistence migrates to unified Mongo-backed schema.
4. Product domains (games, progression, economy, missions) become first-class.

## Trust and Validation Boundaries

Current risk:

- Reward amounts can be overly trusted from the client payload.

Required boundary for next phase:

- Server computes rewards from authoritative game/session state.
- Client sends events, not authoritative currency values.

## Non-Goals in Current MVP

- No full anti-cheat system yet
- No production-grade analytics pipeline
- No complete ad-network integration
- No full realtime gameplay synchronization
