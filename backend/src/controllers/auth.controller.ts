import type { Request, Response } from 'express';
import {
  createStoredUser,
  findUserByEmail,
  findUserById,
  type StoredUser,
} from '../services/userStore.service.js';
import {
  createGuestRecord,
  findGuestById,
  addCoinsToGuest,
  migrateGuestToAccount,
} from '../services/guestStore.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createSessionToken, createGuestToken, verifyGuestToken } from '../utils/token.js';
import type { GuestRecord, PublicGuest } from '../types/user.types.js';
import { logger } from '../logger/logger.js';

function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    coins: user.coins,
  };
}

function toPublicGuest(guest: GuestRecord): PublicGuest {
  return {
    id: guest.id,
    coins: guest.coins,
    signupPromptCount: guest.signupPromptCount,
    signupRequired: guest.signupRequired,
  };
}

/* ---------- existing auth endpoints (backward-compatible) ---------- */

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
    logger.error('register failed', { err: error });
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
  } catch (error) {
    logger.error('login failed', { err: error });
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
  } catch (error) {
    logger.error('me failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}

/* ---------- guest lifecycle endpoints ---------- */

export async function createGuest(_req: Request, res: Response) {
  try {
    const guest = await createGuestRecord();
    const guestToken = createGuestToken(guest.id);

    return res.status(201).json({
      guestToken,
      guest: toPublicGuest(guest),
    });
  } catch (error) {
    logger.error('createGuest failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function getGuest(req: Request, res: Response) {
  try {
    const guestId = req.guestId;
    if (!guestId) {
      return res.status(401).json({ message: 'guest token is required' });
    }

    const guest = await findGuestById(guestId);
    if (!guest) {
      return res.status(404).json({ message: 'guest not found' });
    }

    if (guest.migratedTo) {
      return res.status(410).json({ message: 'guest has been migrated' });
    }

    return res.status(200).json({ guest: toPublicGuest(guest) });
  } catch (error) {
    logger.error('getGuest failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function updateGuestProgression(req: Request, res: Response) {
  try {
    const guestId = req.guestId;
    if (!guestId) {
      return res.status(401).json({ message: 'guest token is required' });
    }

    const { addCoins } = req.body as { addCoins: number };
    const guest = await addCoinsToGuest(guestId, addCoins);

    if (!guest) {
      return res.status(404).json({ message: 'guest not found or already migrated' });
    }

    return res.status(200).json({ guest: toPublicGuest(guest) });
  } catch (error) {
    logger.error('updateGuestProgression failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}

/* ---------- migration endpoint ---------- */

export async function migrateGuest(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    if (!authUserId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const { guestToken } = req.body as { guestToken: string };
    const guestId = verifyGuestToken(guestToken);
    if (!guestId) {
      return res.status(400).json({ message: 'invalid guest token', migrationStatus: 'invalid_token' });
    }

    const result = await migrateGuestToAccount(guestId, authUserId);
    return res.status(200).json({
      migrationStatus: result.status,
      coinsTransferred: result.coinsTransferred,
    });
  } catch (error) {
    logger.error('migrateGuest failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}
