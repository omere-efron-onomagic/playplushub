# Adding a New Game Type

When introducing a new playable game to PlayPlusHub, **admin panel functionality is required**. Players should not be the only way to add content; admins must manage levels and assets.

## Architecture Overview

The admin panel uses a **game editor registry** pattern. Each game has a dedicated editor component that is registered by `gameId`. When an admin navigates to `/admin/games/:gameId/content`, the system loads the appropriate editor from the registry.

## Checklist

1. **Backend**
   - Add game entry to `games_catalog.json` (or create via `POST /admin/games`)
   - Add level/content store and endpoints (e.g. `link_four_levels.json` + rounds API)
   - Expose public read endpoints: `GET /games/:gameId/rounds`, `GET /games/:gameId/rounds/:roundId/levels`
   - Reuse or extend `POST /admin/uploads/images` for asset uploads
   - Add admin write endpoints: `POST /admin/games/:gameId/rounds` or equivalent
   - Add validators in `backend/src/validators/` for game-specific payloads
   - Add admin service methods in `backend/src/services/` for content CRUD
   - Wire routes in `backend/src/routes/admin.routes.ts`

2. **Admin Frontend**
   - Create game editor component implementing `GameEditorProps` interface
   - Place editor in `frontend/src/ui/pages/admin/<gameName>/` directory
   - Use React Hook Form + Zod for validation (see `LinkFourEditor` and `CinemojiEditor` as reference)
   - Add RTK Query endpoints in `frontend/src/store/apis/admin.api.ts`
   - Register editor in `frontend/src/ui/pages/admin/registerEditors.ts`
   - Include save feedback, inline errors, and unsaved-change protection

3. **Player Frontend**
   - Add or extend game page to consume new API
   - Ensure `GamePage` and catalog show the game when enabled

4. **Docs**
   - Update `API_SPEC.md` with new endpoints
   - Update `FEATURE_STATUS.md` and `ARCHITECTURE.md` as needed

## Reference Implementations

### Link Four (Image-based rounds with admin upload)

- **Editor**: `frontend/src/ui/pages/admin/linkfour/LinkFourEditor.tsx`
- **Registry**: Registered for gameId `'1'` in `registerEditors.ts`
- **Validation**: Zod schema in `LinkFourEditor.schema.ts`
- **Backend**: `linkFourLevelStore.service.ts`, `POST /admin/games/:gameId/rounds`
- **Player UI**: `LinkFourGame.tsx`, `GamePage.tsx`
- **RTK Query**: Admin endpoints in `admin.api.ts`, public in `games.api.ts`
- **Persistence**: Supabase (`link_four_levels` table) with JSON fallback via dual-read
- **Features**: Batch image upload, React Hook Form validation, success/error feedback, unsaved-change warnings

### Cinemoji (Emoji-based puzzles with two game modes)

- **Editor**: `frontend/src/ui/pages/admin/cinemoji/CinemojiEditor.tsx`
- **Registry**: Registered for gameId `'13'` in `registerEditors.ts`
- **Validation**: Zod schema in `CinemojiEditor.schema.ts`
- **Backend**: `cinemojiAdmin.service.ts`, admin controller in `cinemojiAdmin.controller.ts`
- **Admin Endpoints**: `POST /admin/cinemoji/puzzles`, `POST /admin/cinemoji/hints`, batch operations, delete
- **Player UI**: `CinemojiGame.tsx` (two modes, keyboard/mobile input, drag-to-match)
- **RTK Query**: Admin endpoints in `admin.api.ts`, player endpoints in `cinemoji.api.ts`
- **Persistence**: Supabase (`cinemoji_puzzles`, `cinemoji_stage_hints` tables) with static file fallback
- **Features**: Tab-based UI (puzzles/hints), inline validation, incremental index suggestions
