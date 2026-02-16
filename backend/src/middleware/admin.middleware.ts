import type { Request, Response, NextFunction } from 'express';

const ADMIN_SECRET_HEADER = 'x-admin-secret';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 8) {
    return res.status(503).json({ message: 'admin panel is not configured' });
  }

  const header = req.headers[ADMIN_SECRET_HEADER];
  const provided = typeof header === 'string' ? header.trim() : '';

  if (!provided || provided !== secret) {
    return res.status(403).json({ message: 'admin access denied' });
  }

  return next();
}
