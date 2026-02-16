import type { Request, Response, NextFunction } from 'express';

/** MVP: admin routes are open. Re-enable by uncommenting secret check. */
export function requireAdmin(_req: Request, _res: Response, next: NextFunction) {
  return next();
}
