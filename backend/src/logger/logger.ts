import winston from 'winston';

/** Keys whose values are redacted in logs. Case-insensitive for object keys. */
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'authorization',
  'token',
  'guesttoken',
  'x-guest-token',
  'cookie',
  'cookies',
  'secret',
  'apikey',
  'api_key',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
]);

const REDACTED = '[REDACTED]';

/** Recursively redacts sensitive keys in objects. */
export function redactSensitive<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item: unknown) => redactSensitive(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      result[key] = SENSITIVE_KEYS.has(lower) ? REDACTED : redactSensitive(value);
    }
    return result as T;
  }
  return obj;
}

const level = process.env.LOG_LEVEL ?? 'debug';

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'ISO' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {},
  transports: [new winston.transports.Console()],
});

export type Logger = winston.Logger;

export { logger };
