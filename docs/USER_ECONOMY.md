# PlayPlusHub User Economy (MVP)

This document defines the economy and conversion behavior for the current MVP.
It updates and simplifies the original concept flow into executable product
rules.

## Economy Goals

- Keep first-time sessions friction-light
- Encourage replay via rewards and progression
- Convert guest users to signed users over repeated wins
- Support monetization when users run out of coins

## Resource Model

- `Coins`: spendable currency to play and purchase avatar accessories
- `XP`: progression metric; baseline MVP award is `+10 XP` per completed level
- `Avatar State`: owned/equipped accessories and visual progression

## MVP Defaults

- Starting coins: `30`
- Cost to play: variable by game/level
- Reward source: level completion
- Coin floor: cannot go below `0`
- Rewarded ad fallback: offered when user has no playable coin balance

## Entry and Onboarding Flows

### Scenario 1: Social Campaign Entry

1. User starts from campaign landing.
2. User completes first playable level.
3. Reward is granted.
4. Soft sign-up prompt appears.
5. User chooses sign-up or continue as guest.

### Scenario 2: Organic Entry

1. User lands on the hub homepage.
2. User chooses to play or sign up.
3. If signed up early, user joins the same progression flow as converted users.

## Conversion Rules

- After each win, show a soft sign-up suggestion.
- Maximum soft suggestions: `5`.
- After the fifth suggestion, sign-up becomes required to continue progression.
- Messaging remains value-based: save progress, keep rewards, and unlock features.

## Reward Rules (MVP)

- Level completion grants coin reward (game/level dependent).
- Level completion grants baseline `+10 XP` (subject to tuning).
- Rewards must be recorded in a persistent profile state.
- Guest progression should persist locally until sign-up.

## Spend Rules

- Starting a level checks required coin cost.
- If `coins < cost`, block start and show options:
  - rewarded ad for coin refill
  - return to hub and choose lower-cost activity
- No negative balances.

## Avatar Economy

- Accessories are unlockable via progression resources.
- Purchase requires sufficient coin balance (and level requirement where relevant).
- Equip state should persist per profile.
- Guest profile should support temporary local ownership/equip state.

## Ads in Economy

Status: `Partial` in MVP.

Planned economy-backed ad behaviors:

- Persistent banner placements in hub and selected pages
- Rewarded video when coins are depleted
- Frequency-capped interstitial opportunities after repeated sessions

## Security and Validation Requirements

Current state: reward payloads are trusted too much by the backend.

Required next steps:

1. Validate reward eligibility server-side.
2. Validate level/game completion events.
3. Prevent duplicate claims.
4. Log suspicious reward patterns.
5. Add idempotent reward transactions.

## MVP vs Next Phase

### Current MVP

- Lightweight backend with JSON-backed persistence
- One implemented game loop
- Basic auth and wallet updates

### Next Phase

- Unified persistence model (Mongo target)
- Multi-game reward governance
- Missions and leaderboard integration
- stronger anti-cheat and auditability
