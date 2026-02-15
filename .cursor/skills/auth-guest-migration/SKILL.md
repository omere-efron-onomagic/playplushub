---
name: auth-guest-migration
description: Use for guest progression persistence, conversion prompts, and guest-to-account migration behavior.
---
# Auth Guest Migration

## When to Use

- Changes touch guest mode persistence.
- Conversion prompt logic is modified.
- Guest-to-registered account migration rules are updated.

## Instructions

1. Document the current user state transitions:
   - anonymous guest
   - prompted guest
   - registered user
2. Define migration trigger and conflict rules clearly.
3. Ensure data transfer is deterministic and idempotent.
4. Keep auth guard behavior explicit for protected resources.
5. Update product and API docs for migration behavior.

## Checklist

- [ ] Guest progress survives expected session boundaries.
- [ ] Migration does not duplicate or lose balances/progression.
- [ ] Prompt cadence follows roadmap constraints.
- [ ] Auth and wallet endpoints remain consistent.
