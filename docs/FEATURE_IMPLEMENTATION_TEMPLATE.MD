Task Type: Feature
Title: <feature title>

Product alignment:
- Roadmap phase: <from docs/ROADMAP_MVP.md>
- Feature status target: <Planned -> Partial | Partial -> Implemented>
- User value: <why this matters now>

Scope:
- Allowed paths:
  - <backend paths>
  - <frontend paths>
  - <docs paths>
- Non-goals:
  - <explicit exclusions>

Requirements:
- Functional:
  - <requirement 1>
  - <requirement 2>
- Technical:
  - Keep backend boundaries: route -> validator -> controller -> service
  - Keep API and RTK Query contracts synchronized
  - Do not rely on template leftovers for critical logic

Constraints:
- Follow .cursor/rules/*
- Keep API contracts stable where possible
- If contract changes are required, update frontend + docs in the same task
- Do not represent planned follow-ups as implemented

Use skills:
- rtk-query-contract-sync
- backend-economy-guardrails (if economy/auth/progression related)
- backend-logging (if backend code changes)
- auth-guest-migration (if guest/account conversion touched)
- mvp-doc-updater

Acceptance criteria:
- [ ] Behavior matches requirements
- [ ] Error and edge states handled
- [ ] Backend/frontend contracts synchronized
- [ ] Docs/status labels updated accurately
- [ ] Checks pass for touched project(s)