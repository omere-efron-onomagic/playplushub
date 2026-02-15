---
name: backend-economy-guardrails
description: Use for wallet, rewards, spending, XP, and anti-cheat related backend changes.
---
# Backend Economy Guardrails

## When to Use

- Changes touch wallet, rewards, spending, XP, or progression integrity.
- Changes include economy endpoints, validators, or persistence logic.
- A task mentions anti-cheat or server authority.

## Instructions

1. Identify the trust boundary first.
   - Client should send events and intent.
   - Server computes and validates the authoritative value.
2. Trace flow end-to-end:
   - Route -> validator -> controller -> service -> persistence.
3. Add or tighten validation for:
   - payload shape and types
   - min/max bounds
   - replay or duplicate claim scenarios
4. Keep API responses explicit and stable.
5. Update frontend contract usage if response schema changes.
6. Update relevant docs:
   - `docs/API_SPEC.md`
   - `docs/FEATURE_STATUS.md`
   - `docs/ARCHITECTURE.md`

## Checklist

- [ ] No direct trust of client reward totals without validation.
- [ ] Protected endpoints use auth middleware.
- [ ] Failure modes return clear status codes/messages.
- [ ] Documentation reflects new behavior and constraints.
