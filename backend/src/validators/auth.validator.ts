import type { NextFunction, Request, Response } from 'express';

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
