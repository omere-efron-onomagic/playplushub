---
name: rtk-query-contract-sync
description: Use when backend endpoint contracts and frontend RTK Query slices must stay aligned.
---
# RTK Query Contract Sync

## When to Use

- Endpoint URL, method, request body, or response shape changes.
- Auth headers or error handling behavior changes.
- New backend route is introduced and must be consumed in frontend.

## Instructions

1. Start from backend route and validator definitions.
2. Confirm controller response schema and status codes.
3. Update/create RTK Query endpoint in `frontend/src/store/apis`.
4. Update related types in the same API slice.
5. Verify consuming components/hooks still match response shape.
6. If contract changes are user-visible, update docs.

## Checklist

- [ ] Endpoint path/method matches backend route.
- [ ] Request payload type matches validator contract.
- [ ] Response type matches controller output.
- [ ] Auth token/header flow remains intact.
