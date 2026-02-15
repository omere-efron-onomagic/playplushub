import { createHmac } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import type { GameSessionPayload } from '../../types/economy.types.js';

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? 'development-auth-secret';
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getAuthSecret()).update(encodedPayload).digest('base64url');
}

export function createGameSessionToken(
  actorId: string,
  gameId: string,
  isGuest = false,
): { sessionId: string; token: string } {
  const sessionId = randomUUID();
  const payload: GameSessionPayload = {
    sessionId,
    userId: actorId,
    gameId,
    exp: Date.now() + SESSION_TTL_MS,
    isGuest: isGuest ? true : undefined,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);
  const token = `${encodedPayload}.${signature}`;
  return { sessionId, token };
}

export function verifyGameSessionToken(token: string): GameSessionPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  if (signature !== expectedSignature) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8'),
    ) as GameSessionPayload;

    if (!decoded.sessionId || !decoded.userId || !decoded.gameId || typeof decoded.exp !== 'number') {
      return null;
    }
    if (Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}
