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

### Dual Storage (Supabase + JSON)

Content is served from **Supabase** with **JSON fallback** based on `CONTENT_STORE_DRIVER`:
- `supabase`: Supabase only
- `dual`: Try Supabase first, fallback to JSON files
- `json`: JSON files only

### Supabase Schema

- **`quizmo_stages`**: stage metadata (stage_id, title, updated_at)
- **`quizmo_questions`**: questions with composite key (stage_id, level_index)

### JSON Seed Source

- Root folder: `QUIZMO/` or `Quizmo/`
- Stage folder: `QUIZMO/stage-1-pop-culture/`
- Stage metadata: `stage.json`
- One folder per level:
  - `level-01/question.json` ... `level-10/question.json`

Each `question.json` includes:
- `imageUrl`
- `question`
- `options` (exactly 4)
- `correctAnswerIndex` (0..3)

### Startup Sync

When `CONTENT_STORE_DRIVER` is `supabase` or `dual`, the backend syncs JSON seed content to Supabase at startup.

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

## Admin Panel

QUIZMO content is managed via `/admin/games/14/content`:

- **Stage Management**: Create/update stages (stageId, title)
- **Question Management**: Upsert/delete questions per stage
- **Editor Component**: `QuizmoEditor` (registered for gameId `14`)
- **Form Validation**: React Hook Form + Zod schemas
- **UX Standards**: Inline errors, save feedback, unsaved state indicators

### Admin API Endpoints

- `GET /admin/quizmo/stages` — list all stages with questions
- `GET /admin/quizmo/stages/:stageId` — get single stage
- `POST /admin/quizmo/stages` — upsert stage metadata
- `POST /admin/quizmo/stages/:stageId/questions` — upsert questions (replaces all)
- `DELETE /admin/quizmo/stages/:stageId` — delete stage and questions
- `DELETE /admin/quizmo/stages/:stageId/questions/:levelIndex` — delete single question

All admin endpoints require Supabase (`CONTENT_STORE_DRIVER` must be `supabase` or `dual`).
