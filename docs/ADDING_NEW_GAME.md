# Adding a New Game Type

When introducing a new playable game to PlayPlusHub, **admin panel functionality is required**. Players should not be the only way to add content; admins must manage levels and assets.

## Checklist

1. **Backend**
   - Add game entry to `games_catalog.json` (or create via `POST /admin/games`)
   - Add level/content store and endpoints (e.g. `link_four_levels.json` + rounds API)
   - Expose public read endpoints: `GET /games/:gameId/rounds`, `GET /games/:gameId/rounds/:roundId/levels`
   - Reuse or extend `POST /admin/uploads/images` for asset uploads
   - Add admin write endpoints: `POST /admin/games/:gameId/rounds` or equivalent

2. **Admin Frontend**
   - Add admin page under `frontend/src/ui/pages/admin/` (e.g. `AdminLinkFourLevels.tsx`)
   - Wire RTK Query mutations in `admin.api.ts` for create/update levels
   - Support batch upload where applicable (drop/select/paste multiple images)
   - Add route in admin router and nav link in `AdminGate`

3. **Player Frontend**
   - Add or extend game page to consume new API
   - Ensure `GamePage` and catalog show the game when enabled

4. **Docs**
   - Update `API_SPEC.md` with new endpoints
   - Update `FEATURE_STATUS.md` and `ARCHITECTURE.md` as needed

## Reference Implementations

### Link Four (Image-based rounds with admin upload)

- Backend: `linkFourLevelStore.service.ts`, `POST /admin/games/:gameId/rounds`, rounds/levels endpoints
- Admin UI: `AdminLinkFourLevels.tsx` (batch upload, answer-only, auto extra letters)
- Player UI: `LinkFourGame.tsx`, `GamePage.tsx`
- RTK Query: `admin.api.ts`, `games.api.ts`
- Persistence: Supabase (`link_four_levels` table) with JSON fallback via dual-read
- Migration: `migrate-json-to-supabase.ts`, `migrate-local-uploads-to-supabase.ts`

### Cinemoji (Text-based puzzles with file/DB content)

- Backend: `cinemoji.service.ts`, `cinemojiSupabase.repository.ts`, `cinemojiFile.repository.ts`
- Content: Supabase (`cinemoji_puzzles`, `cinemoji_stage_hints` tables) with static file fallback
- Player UI: `CinemojiGame.tsx` (two modes, keyboard/mobile input, drag-to-match, stage selection)
- RTK Query: `cinemoji.api.ts`
- Persistence: Supabase dual-read with `Cinemoji/TheGame.txt` and `Cinemoji/stages.txt` fallback
- Migration: `migrate-cinemoji-to-supabase.ts`
- Admin: No custom UI; content managed via Supabase tables and migration scripts
