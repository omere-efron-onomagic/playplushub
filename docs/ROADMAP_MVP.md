# PlayPlusHub MVP Roadmap

This roadmap prioritizes shipping a stable MVP loop before expanding game count.

## Priority Order

1. Auth + persistent guest progression
2. Economy integrity (spend/reward validation)
3. Avatar inventory and shop logic
4. Missions and conversion tooling
5. Leaderboard and ad hardening

## Phase 1: Core Identity and Progress Persistence

Goal: make guest and signed flows reliable.

- [x] Persist guest progression across sessions (backend-issued guest token + server store)
- [x] Implement soft sign-up prompts after each win
- [x] Enforce sign-up requirement after 5 prompts
- [x] Add guest-to-account progression migration behavior (idempotent, account_wins)
- [ ] Ensure onboarding scenario paths are explicit in frontend UX

Exit criteria:

- [x] Guest resumes progress after app restart
- [x] Signed users keep migrated progression
- [x] Conversion prompt cadence behaves by product rule

## Phase 2: Economy Enforcement and Anti-Cheat Foundation

Goal: ensure coin and reward rules are server-authoritative.

- [x] Enforce no-negative balances on backend
- [x] Enforce spend before game start (auth and guest)
- [x] Move reward computation to backend authority
- [x] Add duplicate reward claim protection
- [x] Add transaction-like logs for balance changes
- [x] Guest session flow: guests use session/start and session/claim with spend-before-play

Exit criteria:

- Client cannot directly mint coins by payload manipulation
- Reward and spend actions are auditable

## Phase 3: Avatar and XP System Completion

Goal: complete progression loop with meaningful unlocks.

- Implement XP accumulation (`+10 XP` baseline, configurable)
- Define level thresholds
- Implement avatar inventory ownership state
- Implement purchase/equip flows backed by persistence

Exit criteria:

- Users can earn XP, unlock/buy, and equip consistently across sessions

## Phase 4: Engagement Features

Goal: increase retention and repeat sessions.

- Add daily/weekly missions
- Add leaderboard views and rank context
- Add conversion incentives tied to mission/leaderboard milestones

Exit criteria:

- Users have clear goals beyond one game session

## Phase 5: Monetization Maturity

Goal: complete ad-supported fallback mechanics.

- Integrate rewarded video flow for low-coin recovery
- Add banner/interstitial controls with frequency caps
- Ensure ads do not block first-session engagement

Exit criteria:

- Monetization and retention loops coexist without heavy friction

## Technical Direction Notes

- Current MVP persistence: JSON-backed auth/wallet profile store
- Next architecture target: unified Mongo-backed product persistence
- Keep API contracts stable where possible to reduce frontend churn
