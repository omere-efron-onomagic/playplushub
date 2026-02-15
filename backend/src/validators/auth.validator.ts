import type { NextFunction, Request, Response } from 'express';
import { verifyGuestToken } from '../utils/token.js';

function isValidString(value: unknown, minLength = 1): value is string {
  return typeof value === 'string' && value.trim().length >= minLength;
}

export function validateRegisterBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { name, email, password } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (!isValidString(name)) {
    return res.status(400).json({ message: 'name is required' });
  }
  if (!isValidString(email)) {
    return res.status(400).json({ message: 'email is required' });
  }
  if (!isValidString(password, 6)) {
    return res.status(400).json({ message: 'password must be at least 6 characters' });
  }

  return next();
}

export function validateLoginBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (!isValidString(email) || !isValidString(password)) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  return next();
}

/** Extracts and verifies X-Guest-Token header, attaching guestId to request. */
export function requireGuestToken(req: Request, res: Response, next: NextFunction) {
  const raw = req.headers['x-guest-token'];
  const token = typeof raw === 'string' ? raw.trim() : '';

  if (!token) {
    return res.status(401).json({ message: 'guest token is required' });
  }

  const guestId = verifyGuestToken(token);
  if (!guestId) {
    return res.status(401).json({ message: 'invalid or expired guest token' });
  }

  req.guestId = guestId;
  return next();
}

/** Validates body for PATCH /auth/guest (addCoins). */
export function validateGuestUpdateBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { addCoins } = req.body as { addCoins?: unknown };

  if (typeof addCoins !== 'number' || !Number.isInteger(addCoins) || addCoins <= 0) {
    return res.status(400).json({ message: 'addCoins must be a positive integer' });
  }

  return next();
}

/** Validates body for POST /auth/guest/migrate. */
export function validateMigrateBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { guestToken } = req.body as { guestToken?: unknown };

  if (!isValidString(guestToken)) {
    return res.status(400).json({ message: 'guestToken is required' });
  }

  return next();
}
