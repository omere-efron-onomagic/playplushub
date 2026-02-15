# PlayPlusHub Developer Onboarding

This guide defines the shared Cursor + Git workflow for all collaborators.

## 1) First-Time Setup

1. Install dependencies:
   - `cd backend && npm i`
   - `cd ../frontend && npm i`
2. Configure env files:
   - `backend/.env` with `PORT`, `FRONTEND_URL`, optional `MONGODB_URI`, `AUTH_SECRET`
   - `frontend/.env.development` with `VITE_API_URL`
3. Open the repository root (`playplushub/`) in Cursor.

## 2) Shared Cursor Setup in This Repo

This repo now includes shared project context under `.cursor/`:

- Rules: `.cursor/rules/*.mdc`
- Skills: `.cursor/skills/*/SKILL.md`

### Rules

Rules are committed and apply to everyone in the project.

- `00-product-scope.mdc`: roadmap and status boundaries
- `10-frontend-react-vite.mdc`: React/Vite/RTK Query conventions
- `20-backend-express-economy.mdc`: backend contract and economy guardrails
- `30-docs-sync.mdc`: implementation-to-doc consistency
- `40-template-leftovers.mdc`: safe handling of scaffold modules

### Skills

Skills are reusable playbooks for recurring tasks.

- `backend-economy-guardrails`
- `rtk-query-contract-sync`
- `mvp-doc-updater`
- `auth-guest-migration`

Use skills when a task is domain-specific and repeated.

## 3) Cursor Best Practices for This Project

### Use Agent for multi-file tasks

Use Cursor Agent for cross-cutting work:

- backend + frontend contract changes
- economy/auth hardening
- feature implementation that requires docs updates

For each task prompt, include:

- Goal and constraints
- Affected directories
- Acceptance criteria
- Required docs to update

### Keep personal preferences in User Rules

Use User Rules for personal style preferences only (tone, formatting style, etc.).
Do not place personal preferences in project rules.

### Use `@Docs` for framework/library references

Use `@Docs` in chat when implementing or configuring external libraries.
For this team workflow, prefer official/current docs before coding decisions.

## 4) Worktrees Workflow (Recommended)

Use Git worktrees to isolate streams of work and keep Cursor context clean.

Example:

```bash
git fetch origin
git worktree add ../wt-backend-economy -b feat/backend-economy origin/main
git worktree add ../wt-frontend-ui -b feat/frontend-ui origin/main
git worktree add ../wt-docs-sync -b chore/docs-sync origin/main
```

Recommendations:

- Keep one focused objective per worktree.
- Avoid mixing backend economy changes with unrelated UI polish.
- Prefer Cursor Parallel Agents when you want isolation without opening multiple windows.

### 4.1) Run 4 Tasks in Parallel (Single Cursor Workspace)

This is possible and supported through Cursor Parallel Agents with isolated worktrees.

- Isolation model: each agent runs in its own worktree/branch.
- Benefit: tasks do not overwrite each other during execution.
- Limitation: if two tasks edit the same lines/files, merge conflicts can still happen during integration.

Recommended task split when work may overlap:

1. `task-1`: backend contract or core logic change
2. `task-2`: frontend integration for updated contracts
3. `task-3`: tests/hardening
4. `task-4`: docs and status sync

Execution flow:

1. Launch 4 agent tasks from the same repository context.
2. Assign each task a clear scope and output format (use the templates in section 9).
3. Keep each task on a dedicated branch/worktree.
4. Integrate in order to reduce conflicts:
   - backend/core first
   - frontend integration second
   - tests/hardening third
   - docs sync last
5. If conflicts happen, resolve once during integration and keep docs aligned with final behavior.

Suggested branch naming:

- `parallel/task-1-backend-core`
- `parallel/task-2-frontend-integration`
- `parallel/task-3-tests-hardening`
- `parallel/task-4-docs-sync`

Conflict-safe rules for all 4 tasks:

- Define allowed paths for each task in the prompt.
- Require PR summaries with changed files and risk notes.
- Require docs update checklist completion when auth/wallet/economy/API/progression changes.

## 5) MCP and Integrations

Cursor supports MCP tools for connected context and tooling.

Recommended baseline:

- Keep `context7` available for official docs lookups.
- Add browser MCP tools for frontend validation tasks when needed.
- Add DB MCP only when Mongo-backed flows become first-class.

Keep team MCP usage conventions documented in PR descriptions when relevant.

## 6) Daily Engineering Best Practices

- Follow roadmap order in `docs/ROADMAP_MVP.md` unless priority changes are explicit.
- Respect feature status boundaries in `docs/FEATURE_STATUS.md`.
- Keep API contract and client usage synchronized.
- Treat economy logic as server-authoritative.
- Update docs in the same PR when behavior changes.

## 7) Definition of Done (Per Task)

Before opening/merging a PR:

1. Run checks in touched project(s):
   - Frontend: `npm run check`
   - Backend: `npm run typecheck && npm run lint`
2. Verify docs updates for behavior/contract changes.
3. Keep changes scoped and readable.
4. Include a PR summary with:
   - What changed
   - Why
   - Risks/known limitations

## 8) Optional Team Automation with Cursor CLI

Cursor CLI workflows can be added for:

- automated PR code review
- docs update assistance
- security/secret audits

If enabled, keep comments concise and focus on high-confidence findings.

## 9) Ready-to-Copy Task Templates

Use these prompts with Cursor Agent for consistent execution and review quality.

### A) Bugfix Template (with PR checklist)

```text
Task Type: Bugfix
Title: <short bug title>

Context:
- Reported issue: <what breaks and where>
- Expected behavior: <expected result>
- Current behavior: <actual result>
- Environment: <frontend/backend/both, route/page, user state>

Scope:
- Allowed paths:
  - <path 1>
  - <path 2>
- Out of scope:
  - <what should not be touched>

Constraints:
- Follow all project rules in .cursor/rules/*
- Preserve existing API contract unless change is required for the fix
- Keep change minimal and safe
- If auth/wallet/progression/API behavior changes, update docs

Use skills:
- backend-economy-guardrails (if wallet/reward/spend/auth related)
- rtk-query-contract-sync (if backend/frontend contract is touched)
- mvp-doc-updater (if behavior/status/docs must change)

Implementation plan:
1) Reproduce root cause from code path
2) Apply smallest safe fix
3) Add/adjust validation or guards as needed
4) Update affected docs if behavior/contract changed
5) Run required checks for touched project(s)

Acceptance criteria:
- [ ] Original issue is resolved
- [ ] No regression in related flow
- [ ] API/response shape unchanged (or explicitly documented if changed)
- [ ] Docs updated when behavior/contract changed
- [ ] Checks pass for touched project(s)

PR checklist:
- [ ] Root cause explained in 1-2 sentences
- [ ] Fix summary is clear and scoped
- [ ] Risk/edge cases documented
- [ ] Test/verification steps included
- [ ] Relevant docs updated:
  - [ ] docs/FEATURE_STATUS.md
  - [ ] docs/API_SPEC.md
  - [ ] docs/ARCHITECTURE.md
  - [ ] README.md (if index/setup changed)
```

### B) Feature Delivery Template (with PR checklist)

```text
Task Type: Feature
Title: <feature title>

Product alignment:
- Roadmap phase: <phase from docs/ROADMAP_MVP.md>
- Feature status target: <Planned -> Partial | Partial -> Implemented>
- User value: <why this matters now>

Scope:
- Allowed paths:
  - <path 1>
  - <path 2>
- Non-goals:
  - <explicit exclusions>

Requirements:
- Functional:
  - <requirement 1>
  - <requirement 2>
- Technical:
  - Keep route -> validator -> controller -> service boundaries (backend)
  - Keep RTK Query contracts aligned (frontend)
  - Avoid template leftovers for critical logic

Constraints:
- Follow all project rules in .cursor/rules/*
- Keep API contracts stable where possible
- If contract changes are required, update frontend + docs in same task
- Do not present planned follow-ups as implemented behavior

Use skills:
- rtk-query-contract-sync (for API/client contract alignment)
- backend-economy-guardrails (for economy/auth/progression logic)
- auth-guest-migration (if guest/register migration is involved)
- mvp-doc-updater (for status/architecture/API docs updates)

Implementation plan:
1) Define contract and validation boundaries
2) Implement backend/frontend changes
3) Wire UI state and loading/error handling
4) Update docs and feature status labels
5) Run required checks for touched project(s)

Acceptance criteria:
- [ ] Feature behavior matches requirements
- [ ] Error and edge states handled
- [ ] API and frontend contracts are synchronized
- [ ] Status docs accurately reflect delivered scope
- [ ] Checks pass for touched project(s)

PR checklist:
- [ ] Scope and non-goals are explicit
- [ ] User-visible behavior summarized
- [ ] API changes listed (if any)
- [ ] Follow-up work listed as planned (not implied done)
- [ ] Verification steps included
- [ ] Relevant docs updated:
  - [ ] docs/FEATURE_STATUS.md
  - [ ] docs/API_SPEC.md
  - [ ] docs/ARCHITECTURE.md
  - [ ] docs/ROADMAP_MVP.md (if priority/status changed)
  - [ ] README.md (if setup/index changed)
```
