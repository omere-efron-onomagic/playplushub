# QUIZMO Feature (Implemented)

## Product alignment

- Roadmap phase: MVP - Games Library Expansion
- Feature status: Implemented
- User value: Fast quiz gameplay loop with score-based rewards and ad-ready placeholders.

## Scope implemented

- New game in catalog: `QUIZMO` (`gameId: 14`)
- Stage 1 only: Pop Culture
- 10 levels/questions
- 10-second timer per question
- 4 options per question
- End-of-stage summary with score and coins earned
- Persistent in-game ad placeholder slot

## Content source of truth

- Root folder: `QUIZMO/`
- Stage folder: `QUIZMO/stage-1-pop-culture/`
- Stage metadata: `stage.json`
- One folder per level:
  - `level-01/question.json` ... `level-10/question.json`

Each `question.json` includes:
- `imageUrl`
- `question`
- `options` (exactly 4)
- `correctAnswerIndex` (0..3)

Backend parses these files and serves public stage/question endpoints.

## API contract

- `GET /quizmo/stages`
- `GET /quizmo/stages/:stageId/questions`
- `POST /quizmo/stages/:stageId/questions/:levelIndex/submit`
- `POST /quizmo/stages/:stageId/complete` (auth user or guest token required)

Completion request body:
- `sessionToken` (from `POST /wallet/session/start`)
- `stageId`
- `answers[]` (`levelIndex`, `answerIndex` nullable)

Completion response includes:
- `correctCount`, `totalQuestions`
- `coinsEarned`
- updated `coins`
- reward `formula`

## Reward formula

- `coinsEarned = correctCount * 2`
- Example: 7 correct -> 14 coins

## Economy + integrity

- Entry spend still uses `POST /wallet/session/start`
- Stage completion verifies session token ownership
- One-time claim enforced via session claim lock
- Reward transaction logged in economy audit store
