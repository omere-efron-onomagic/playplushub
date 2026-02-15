# PlayPlusHub Product Overview

## Purpose

PlayPlusHub is a game hub designed like a vending machine, focused on short,
mentally engaging sessions (puzzles, trivia, thinking games). It is built as a
hackathon MVP to validate engagement and conversion loops.

## Audience

- Primary focus: users aged 30+, mainly women
- Usage pattern: short "time-killer" sessions during travel or idle moments
- Acquisition: social campaigns and organic traffic

## Product Position

- Multi-game platform vision
- Current reality: one fully playable game, with platform scaffolding around it
- Brand: currently "PlayPlusHub" (subject to change)

## Core User Scenarios

### Scenario 1: Social Campaign Onboarding

1. User lands from social campaign.
2. User plays first level.
3. User gets coin reward.
4. User sees a soft sign-up suggestion modal.
5. User can continue as guest or sign up.
6. After each win, sign-up is suggested again.
7. After five suggestions, sign-up becomes required.

### Scenario 2: Organic Entry

1. User lands on homepage from search/organic channel.
2. User starts a game or signs up directly.
3. If user signs up first, they join the same loop as scenario 1.
4. The user is treated as a converted user from mid-onboarding.

## Gameplay and Progression Intent

- Coins are earned from gameplay rewards.
- Coins are spent to continue playing.
- XP tracks progression and drives avatar-related unlocks.
- Users can buy avatar accessories with progression resources.
- If coins are depleted, rewarded video ads can refill coins.

## MVP Economics Defaults

- Starting balance: 30 coins
- Cost to play: varies by game/level
- Rewards: per level
- XP default for MVP docs: +10 XP baseline
- No negative coin balances

## Implementation Philosophy (Current MVP)

- Build lightweight, testable loops first
- Keep friction low for first sessions
- Convert users gradually with value-based prompts
- Persist guest progress locally, then associate on sign-up

## Success Signals for MVP

- Session length and repeat sessions
- Win rate and level completion
- Guest-to-signed conversion rate
- Ad interaction where coins are depleted
- Multi-game expansion readiness
