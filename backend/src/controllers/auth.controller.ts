import type { Request, Response } from 'express';
import {
  createStoredUser,
  findUserByEmail,
  findUserById,
  type StoredUser,
} from '../services/userStore.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createSessionToken } from '../utils/token.js';

function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    coins: user.coins,
  };
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    const passwordHash = hashPassword(password);
    const user = await createStoredUser({ name, email, passwordHash });
    const token = createSessionToken(user.id);

    return res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'email_exists') {
      return res.status(409).json({ message: 'email already exists' });
    }
    return res.status(500).json({ message: 'server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'invalid email or password' });
    }

    const token = createSessionToken(user.id);
    return res.status(200).json({
      token,
      user: toPublicUser(user),
    });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    if (!authUserId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const user = await findUserById(authUserId);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    return res.status(200).json({
      user: toPublicUser(user),
    });
  } catch {
    return res.status(500).json({ message: 'server error' });
  }
}
