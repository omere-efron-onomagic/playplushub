# Test Scenarios

## Backend Unit Tests (Vitest)

- `linkFourLevelStore.test.ts`: Round structure (5 rounds, 2 levels each), level answers, non-round game handling.

## Backend Integration Scenarios (to implement when infra exists)

- **Start blocked for completed round**: User/guest completes round-1, tries `POST /wallet/session/start` with `gameId: "1"`, `roundId: "round-1"` → 422 `ROUND_ALREADY_COMPLETED`.
- **Claim succeeds once per round**: User completes both levels in round-1, calls claim → 200 with coins; second claim for same session → 409 `DUPLICATE_CLAIM`.
- **All-rounds-complete gate**: User completes all 5 rounds; `POST /wallet/session/start` for any round → 422 (round already completed).
- **Guest prompt cadence per round**: Guest completes round-1 and claims → `signupPromptCount` increments by 1; evaluate after each round, not only after all rounds.

## Frontend E2E (Playwright)

- `economy-session.spec.ts`: Auth/guest session start, play, claim, win state, insufficient funds, direct /play/1 redirect.
- `guest-flow.spec.ts`: Guest play flow, level display, redirect from /play/1 without session.
- Round-based flow: Game page shows round buttons; first playable round has `data-testid="game-play-now"`; completed rounds show (done) and are disabled.
