# Cinemoji Feature (Partial)

## Product alignment

- Roadmap phase: MVP - Games Library Expansion
- Feature status: Partial
- User value: Adds a replayable English emoji-title puzzle with keyboard/mobile input, drag matching, stage progression, and ad-ready surfaces.

## Content source of truth

- `Cinemoji/TheGame.txt`: canonical puzzle rows (emoji pair + title).
- `Cinemoji/stages.txt`: canonical stage hints for mode 1 and mode 2.

Backend parses these files and serves content APIs. Frontend does not hardcode puzzle sets.

## Modes

### Mode 1: Emoji + Emoji

- 4 stages, 10 puzzles per stage (40 total).
- User solves title from emoji pair using keyboard input (web + mobile) and optional letter-bank assist.
- Answer-length slots are shown for each puzzle.
- Correct answer shows centered `CORRECT` (no ad in success overlay), then advances.
- Includes a persistent bottom ad placeholder in-mode.
- Hint flow:
  - Confirmation: "Watch to earn a hint?"
  - `No`: return to puzzle.
  - `Yes`: rewarded video popup placeholder, then stage hint is revealed.

### Mode 2: Connect the Emojis

- 8 stages, 5 rounds per stage (40 total rounds).
- Each round shows 5 left choices and 5 right choices.
- User drags from left emoji to right emoji (pointer/touch unified behavior), with live line preview.
- Completing a connection acts as submit (no submit button).
- Correct answer shows `CORRECT` + title.
- Includes persistent in-mode ad placeholder slot.
- Lives:
  - Start with 3 lives.
  - UI shows lives as hearts.
  - Wrong attempt consumes 1 life.
  - Wrong attempts show visual feedback.
  - At 0 lives, user can watch rewarded placeholder for **+1 life** (chosen behavior).
  - If declined, mode restarts from the beginning of the selected stage.

## Backend API

- `GET /cinemoji/content`
- `POST /cinemoji/mode1/submit`
- `POST /cinemoji/mode2/submit`
- `POST /cinemoji/hint`
- `POST /cinemoji/mode2/lives/continue`
- `GET /cinemoji/progress`
- `POST /cinemoji/progress/complete`

Validation covers mode, stage, puzzle/round index, and payload shape.
Guess normalization is backend-consistent (trim/case/punctuation-insensitive).

## Stage progression

- Stage completion is persisted per actor (auth user or guest token).
- On re-enter, frontend fetches completion state and allows selecting uncompleted stages.
- Completed stages are displayed as completed and not re-rewarded via stage completion flow.

## Economy contract

- Game entry spend remains `POST /wallet/session/start`.
- Completion reward remains `POST /wallet/session/claim`.
- Cinemoji completion claims with deterministic valid outcome payload (`1/1 won`).
