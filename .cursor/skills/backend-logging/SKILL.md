---
name: backend-logging
description: Use when adding or refactoring backend observability—controllers, services, middleware, or startup.
---
# Backend Logging Skill

## When to Use

- Adding new backend routes, controllers, or services.
- Refactoring existing backend code that uses `console.*`.
- Implementing error handling or startup flows.
- Adding request/response or business-event observability.

## Instructions

1. **Import the logger**: `import { logger } from '../logger/logger.js';` (adjust path).
2. **Replace `console.*`**: Use `logger.debug`, `logger.info`, `logger.warn`, or `logger.error` instead.
3. **Error paths**: In every `catch` block that returns 500, add `logger.error('descriptive_message', { err: error })` before the response.
4. **Structured metadata**: Pass a second object argument for context, e.g. `{ userId, action, durationMs }`.
5. **Redaction**: When logging user input, body, or headers, use `redactSensitive()` from the logger module. The request middleware already redacts common auth fields.
6. **Level choice**:
   - `debug`: request details, internal flow
   - `info`: successful operations, startup
   - `warn`: recoverable problems, fallbacks
   - `error`: failures, exceptions

## References

- [backend/src/logger/logger.ts](mdc:backend/src/logger/logger.ts) – logger module
- [backend/src/middleware/request-logger.middleware.ts](mdc:backend/src/middleware/request-logger.middleware.ts) – HTTP request logging
- [.cursor/rules/25-backend-logging.mdc](mdc:.cursor/rules/25-backend-logging.mdc) – logging rule

## Checklist

- [ ] No `console.log`, `console.error`, `console.warn`, or `console.debug` in changed files.
- [ ] All catch blocks that return 5xx log with `logger.error`.
- [ ] Log messages include descriptive identifiers.
- [ ] Sensitive data is redacted when logging user input.
