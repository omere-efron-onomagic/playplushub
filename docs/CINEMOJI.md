# Cinemoji Feature (Implemented)

## Product alignment

- Roadmap phase: MVP - Games Library Expansion
- Feature status: Implemented
- User value: Adds a replayable English emoji-title puzzle with mode variety and ad-ready surfaces.

## Content source of truth

- `Cinemoji/TheGame.txt`: canonical puzzle rows (emoji pair + title).
- `Cinemoji/stages.txt`: canonical stage hints for mode 1 and mode 2.

Backend parses these files and serves content APIs. Frontend does not hardcode puzzle sets.

## Modes

### Mode 1: Emoji + Emoji

- 4 stages, 10 puzzles per stage (40 total).
- User solves title from emoji pair using letter bank.
- Correct answer shows centered `CORRECT` and ad placeholder, then advances.
- Hint flow:
  - Confirmation: "Watch a video to get a hint?"
  - `No`: return to puzzle.
  - `Yes`: shows rewarded video placeholder and stage hint.

### Mode 2: Connect the Emojis

- 8 stages, 5 rounds per stage (40 total rounds).
- Each round shows 5 left choices and 5 right choices.
- User selects one left + one right; backend validates against canonical pair.
- Correct answer shows `CORRECT` + title + ad placeholder.
- Includes persistent in-mode ad placeholder slot.
- Lives:
  - Start with 3 lives.
  - Wrong attempt consumes 1 life.
  - At 0 lives, user can watch rewarded placeholder for **+1 life** (chosen behavior).
  - If declined, mode restarts from stage 1.

## Backend API

- `GET /cinemoji/content`
- `POST /cinemoji/mode1/submit`
- `POST /cinemoji/mode2/submit`
- `POST /cinemoji/hint`
- `POST /cinemoji/mode2/lives/continue`

Validation covers mode, stage, puzzle/round index, and payload shape.
Guess normalization is backend-consistent (trim/case/punctuation-insensitive).

## Economy contract

- Game entry spend remains `POST /wallet/session/start`.
- Completion reward remains `POST /wallet/session/claim`.
- Cinemoji completion claims with deterministic valid outcome payload (`1/1 won`).
