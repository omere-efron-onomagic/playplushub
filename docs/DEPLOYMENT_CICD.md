# Deployment and CI/CD (MVP)

This runbook configures automatic deployment on push to `main` with:

- Frontend: Vercel
- Backend: Render
- CI gate: GitHub Actions (`.github/workflows/ci.yml`)

## 1) One-time External Setup

### GitHub

1. Ensure default branch is `main`.
2. In `Settings -> Branches`, add protection for `main`:
   - Require pull request before merge (recommended).
   - Require status checks to pass.
3. Add these required checks:
   - `Backend checks`
   - `Frontend checks`

### Render (backend)

1. Create a Render Web Service from this repo.
2. Set:
   - Root directory: `backend`
   - Branch: `main`
   - Auto deploy: enabled
   - Build command: `npm ci`
   - Start command: `npm run start`
   - Health check path: `/health`
3. Add a persistent disk (optional if using Supabase for content).
4. Use these backend env vars:
   - `FRONTEND_URL` = your Vercel production URL
   - `AUTH_SECRET` = strong random secret
   - `ADMIN_SECRET` = optional (MVP: admin is open; set for future auth)
   - `LOG_LEVEL` = `info` (recommended in production)
   - `MONGODB_URI` = optional
   - `DATA_DIR` = `<persistent-mount>/data` (JSON fallback)
   - `UPLOADS_DIR` = `<persistent-mount>/uploads` (local upload fallback)

For production game data and image storage, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md). When configured, add:

   - `SUPABASE_URL` = Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = service role key
   - `SUPABASE_STORAGE_BUCKET` = `game-assets`
   - `CONTENT_STORE_DRIVER` = `dual` or `supabase`

`DATA_DIR` and `UPLOADS_DIR` remain used for JSON/user-progress and dual-read fallback until cutover.

### Vercel (frontend)

1. Import this repo in Vercel.
2. Set root directory to `frontend`.
3. Set production branch to `main`.
4. Set production env var:
   - `VITE_API_URL` = your Render backend URL (for example, `https://your-api.onrender.com`)

## 2) How Auto Deploy Works

1. Open a PR to `main`.
2. GitHub Actions runs:
   - backend typecheck
   - frontend typecheck
3. Merge PR only after checks pass.
4. Push/merge to `main` triggers:
   - Render backend deployment
   - Vercel frontend deployment

## 3) First Verification

After first production deploy:

1. Check backend health:
   - `GET <render-url>/health` returns `{ "ok": true }`
2. Open frontend URL and verify:
   - game catalog loads
   - auth works
   - wallet/session flow works
3. Upload one image in `/admin/upload` and verify it remains available after a backend redeploy. With Supabase Storage, images persist across redeploys without a disk.

## 4) Troubleshooting

### CORS blocked

- Ensure backend `FRONTEND_URL` exactly matches the Vercel production origin.
- If using preview URLs, include them in `FRONTEND_URL` as comma-separated origins.

### Frontend cannot reach backend (e.g. admin "Failed to load games")

- Verify `VITE_API_URL` in Vercel points to the correct Render URL (e.g. `https://your-app.onrender.com`).
- Redeploy frontend after env var change.
- Ensure backend `FRONTEND_URL` includes your Vercel origin (CORS).

### Data resets after deploy

- If using Supabase: verify `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CONTENT_STORE_DRIVER` are set.
- If using JSON/disk: check Render persistent disk is attached; verify `DATA_DIR` and `UPLOADS_DIR` point inside that mount path.

### CI checks not enforced

- Confirm branch protection on `main` requires status checks.
- Ensure check names match exactly: `Backend checks`, `Frontend checks`.

## 5) Cursor Project Setup for CI/CD Work

When making CI/CD changes with Cursor Agent:

1. Keep this file, `.github/workflows/ci.yml`, and `README.md` aligned in the same task.
2. Follow `.cursor/rules/35-ci-cd-delivery.mdc` for CI/deployment guardrails.
3. Verify workflow script commands match package scripts in:
   - `backend/package.json`
   - `frontend/package.json`
4. Never commit `.env` changes or secret values while adjusting deployment setup.
