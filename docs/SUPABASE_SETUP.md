# Supabase Production Storage Setup

This guide covers external actions to migrate game data and image uploads from local JSON/filesystem to Supabase (Postgres + Storage).

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Create a new project (free tier).
3. Wait for the project to finish provisioning.

## 2. Create Storage Bucket

1. In the Supabase dashboard, open **Storage**.
2. Click **New bucket**.
3. Name: `game-assets`
4. Set **Public bucket** to ON (so game images are publicly accessible).
5. Create the bucket.

## 3. Run Database Schema

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of `backend/supabase-schema.sql`.
3. Run the query.

The schema creates:

- `games` table (game catalog)
- `link_four_levels` table (Link Four level definitions)

## 4. Get Credentials

1. Go to **Project Settings** -> **API**.
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (under Project API keys) → `SUPABASE_SERVICE_ROLE_KEY`

## 5. Configure Render Environment Variables

Add these to your Render backend service:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | The service_role key from Project Settings |
| `SUPABASE_STORAGE_BUCKET` | `game-assets` (default) |
| `CONTENT_STORE_DRIVER` | `dual` (initially; use `supabase` after verification) |

`DATA_DIR` and `UPLOADS_DIR` remain useful for JSON fallback and any non-migrated data; you can keep them or remove after cutover.

## 6. Run Migrations (local, with env loaded)

From the `backend/` directory, with `.env` containing Supabase credentials:

```bash
# Dry run first
npm run migrate:json -- --dry-run
npm run migrate:uploads -- --dry-run

# Apply migrations
npm run migrate:json
npm run migrate:uploads -- --update-json
```

- `migrate:json`: Copies games and levels from JSON files into Supabase.
- `migrate:uploads`: Uploads local `/uploads` files to Storage and updates level image URLs. Use `--update-json` to also rewrite `link_four_levels.json` for dual-read fallback.

## 7. Validation Checklist

Before cutover, verify:

- [ ] Admin `/admin/games`: games list loads
- [ ] Admin `/admin/levels`: create round with 4 images works; new round appears in list
- [ ] Admin `/admin/upload`: single image upload returns URL; image loads
- [ ] Public `/`: game catalog displays
- [ ] Public `/game/:gameId`: game detail loads
- [ ] Public `/play/:gameId`: Link Four plays; level images load (including migrated ones)
- [ ] Backend redeploy: data and images persist

## 8. Cutover

1. Set `CONTENT_STORE_DRIVER=supabase` in Render.
2. Redeploy the backend.
3. Re-run the validation checklist.

Optional: Keep JSON files as backup for a short period, then archive.
