---
name: mvp-doc-updater
description: Use after implementation changes to keep roadmap, status, API, and architecture docs accurate.
---
# MVP Documentation Updater

## When to Use

- Any feature state changes (`Planned` -> `Partial` -> `Implemented`).
- Any auth/wallet/economy/API/architecture/logging behavior changes.
- README setup or project structure has changed.

## Instructions

1. Update only docs impacted by the code change.
2. Keep status statements concrete and verifiable.
3. Avoid speculative language unless explicitly marked as planned.
4. Keep terminology consistent across docs.
5. Ensure README doc index still points to valid docs.

## Checklist

- [ ] `docs/FEATURE_STATUS.md` is accurate.
- [ ] `docs/API_SPEC.md` matches runtime behavior.
- [ ] `docs/ARCHITECTURE.md` reflects data flow.
- [ ] `README.md` links and setup notes remain correct.
