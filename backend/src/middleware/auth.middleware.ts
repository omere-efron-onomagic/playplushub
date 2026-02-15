import type { NextFunction, Request, Response } from 'express';
import { verifySessionToken } from '../utils/token.js';
import { verifyGuestToken } from '../utils/token.js';

declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
      guestId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'authorization token is required' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const payload = verifySessionToken(token);

  if (!payload) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }

  req.authUserId = payload.sub;
  return next();
}

/** Accepts either Bearer auth or X-Guest-Token. Requires exactly one. */
export function requireAuthOrGuest(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const guestHeader = req.headers['x-guest-token'];
  const guestToken = typeof guestHeader === 'string' ? guestHeader.trim() : '';

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifySessionToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'invalid or expired token' });
    }
    req.authUserId = payload.sub;
    return next();
  }

  if (guestToken) {
    const guestId = verifyGuestToken(guestToken);
    if (!guestId) {
      return res.status(401).json({ message: 'invalid or expired guest token' });
    }
    req.guestId = guestId;
    return next();
  }

  return res.status(401).json({ message: 'authorization or guest token is required' });
}
