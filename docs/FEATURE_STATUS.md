# PlayPlusHub Feature Status

Status labels:

- `Implemented`: works in code now
- `Partial`: present but incomplete, static, or MVP-only quality
- `Planned`: intended but not implemented yet

## Platform and UX

| Feature | Status | Notes |
|---|---|---|
| Vending-machine themed hub UI | Partial | Polished visuals exist, but economy data is not fully wired |
| Multi-game catalog | Partial | Many game cards exist, but one playable game is implemented |
| Responsive navigation/pages | Implemented | Core routing and pages are present |
| Onboarding scenarios (social + organic) | Partial | Flow exists conceptually; conversion logic not fully enforced |
| Soft sign-up prompts | Partial | Auth pages exist; prompt cadence logic is not fully implemented |
| Sign-up requirement after 5 prompts | Planned | Product rule approved; not enforced in backend/frontend flow |

## Gameplay and Economy

| Feature | Status | Notes |
|---|---|---|
| One playable game loop | Implemented | Link-four style game is playable end-to-end |
| Per-level rewards | Partial | Reward call exists; server trusts client payload |
| Coin spend to start game | Planned | No strict server-side spending enforcement yet |
| No-negative coin rule | Planned | Rule defined; not globally enforced by all game flows |
| XP progression (+10 baseline) | Planned | Product rule defined in docs for MVP |
| Avatar accessories purchase/equip | Partial | UI exists; purchase/equip persistence is not complete |
| Favorites | Partial | Static demo behavior, not user-persisted |
| Trending | Partial | Static IDs, not analytics-driven |

## Auth, Persistence, Backend

| Feature | Status | Notes |
|---|---|---|
| Register/login/me API | Implemented | Basic auth endpoints and token flow exist |
| Guest mode | Implemented | Backend-issued guest token with server-persisted progression |
| Guest persistence across sessions | Implemented | Guest token stored client-side; progression persisted server-side in JSON store |
| Guest-to-account migration | Implemented | Idempotent migration via `/auth/guest/migrate`; `account_wins` conflict resolution |
| Wallet reward endpoint | Partial | Works, but anti-cheat validation is missing |
| Backend persistence approach (JSON) | Implemented | Current MVP source of truth for auth/wallet users |
| Full Mongo-backed backend | Planned | Target direction after MVP stabilization |

## Growth and Monetization

| Feature | Status | Notes |
|---|---|---|
| Ad placements in UX | Partial | Placement concepts and UI slots exist |
| Rewarded ads for coin refill | Planned | Core ad network integration not completed |
| Missions (daily/weekly) | Planned | Flow exists in product doc, not in code |
| Leaderboard | Planned | Product target only |
| Anti-cheat and reward validation | Planned | Needed before scale |

## Template/Scaffold Leftovers

| Item | Status | Notes |
|---|---|---|
| `pokemonApi` example | Partial | Template demo module, not product-critical |
| `counter` slice | Partial | Starter artifact, not product-critical |
| socket client scaffold | Partial | Infrastructure exists; URLs are empty and no server integration |
