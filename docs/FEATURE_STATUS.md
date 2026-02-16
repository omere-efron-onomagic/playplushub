# PlayPlusHub Feature Status

Status labels:

- `Implemented`: works in code now
- `Partial`: present but incomplete, static, or MVP-only quality
- `Planned`: intended but not implemented yet

## Testing

| Feature | Status | Notes |
|---|---|---|
| E2E regression suite (Playwright) | Implemented | Smoke, auth, economy, guest flows; reuse-running servers |

## Platform and UX

| Feature | Status | Notes |
|---|---|---|
| Vending-machine themed hub UI | Implemented | Polished visuals; game catalog and levels fetched from API |
| Multi-game catalog | Implemented | Dynamic catalog from `GET /games`; one playable game (Link Four) with levels from API |
| Responsive navigation/pages | Implemented | Core routing and pages are present |
| Onboarding scenarios (social + organic) | Partial | Flow exists conceptually; conversion logic not fully enforced |
| Soft sign-up prompts | Implemented | Shown after each guest win before threshold |
| Sign-up requirement after 5 prompts | Implemented | Server-authoritative; gate enforced in backend and frontend |

## Gameplay and Economy

| Feature | Status | Notes |
|---|---|---|
| One playable game loop | Implemented | Link-four style game is playable end-to-end |
| Grouped rounds (5 rounds × 2 levels) | Implemented | Link Four organized into rounds; one charge and one reward per round |
| No replay of completed rounds | Implemented | Server blocks start for completed rounds; all-rounds-complete gates further play |
| Per-round rewards | Implemented | Server-authoritative; reward computed from game catalog when both levels in round completed |
| Coin spend to start game | Implemented | `POST /wallet/session/start` deducts cost before play (auth and guest users) |
| No-negative coin rule | Implemented | Enforced on spend; balance never goes negative |
| XP progression (+10 baseline) | Planned | Product rule defined in docs for MVP |
| Avatar accessories purchase/equip | Partial | UI exists; purchase/equip persistence is not complete |
| Favorites | Partial | Uses API catalog; not user-persisted |
| Trending | Partial | Uses API catalog; IDs static, not analytics-driven |

## Auth, Persistence, Backend

| Feature | Status | Notes |
|---|---|---|
| Register/login/me API | Implemented | Basic auth endpoints and token flow exist |
| Guest mode | Implemented | Backend-issued guest token with server-persisted progression; guests use session/start and session/claim (spend-before-play) |
| Guest persistence across sessions | Implemented | Guest token stored client-side; progression persisted server-side in JSON store |
| Guest-to-account migration | Implemented | Idempotent migration via `/auth/guest/migrate`; `account_wins` conflict resolution |
| Wallet session endpoints | Implemented | start/claim with anti-replay, server-authoritative reward |
| Backend persistence approach (JSON) | Implemented | Current MVP source of truth for auth/wallet/game catalog |
| Admin panel | Implemented | Single-secret gate; games list, level management, image upload |
| Admin upload-first level creation | Implemented | Upload 4 images + answer only; extra letters auto-generated |
| Game catalog (JSON) | Implemented | `games_catalog.json` + `link_four_levels.json`; economy reads from catalog |
| Full Mongo-backed backend | Planned | Target direction after MVP stabilization |

## Growth and Monetization

| Feature | Status | Notes |
|---|---|---|
| Ad placements in UX | Partial | Placement concepts and UI slots exist |
| Rewarded ads for coin refill | Planned | Core ad network integration not completed |
| Missions (daily/weekly) | Planned | Flow exists in product doc, not in code |
| Leaderboard | Planned | Product target only |
| Anti-cheat and reward validation | Implemented | Session token, one-time claim, server-computed rewards |

## Template/Scaffold Leftovers

| Item | Status | Notes |
|---|---|---|
| `pokemonApi` example | Partial | Template demo module, not product-critical |
| `counter` slice | Partial | Starter artifact, not product-critical |
| socket client scaffold | Partial | Infrastructure exists; URLs are empty and no server integration |
