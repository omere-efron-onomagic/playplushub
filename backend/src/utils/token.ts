import { createHmac } from 'node:crypto';

type SessionPayload = {
  sub: string;
  exp: number;
};

type GuestPayload = {
  sub: string;
  type: 'guest';
  exp: number;
};

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const NINETY_DAYS_IN_MS = 90 * 24 * 60 * 60 * 1000;

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? 'development-auth-secret';
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getAuthSecret()).update(encodedPayload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    sub: userId,
    exp: Date.now() + THIRTY_DAYS_IN_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8'),
    ) as SessionPayload;

    if (!decodedPayload.sub || typeof decodedPayload.exp !== 'number') {
      return null;
    }

    if (Date.now() > decodedPayload.exp) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

export function createGuestToken(guestId: string): string {
  const payload: GuestPayload = {
    sub: guestId,
    type: 'guest',
    exp: Date.now() + NINETY_DAYS_IN_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/** Returns the guest ID if the token is valid, or null otherwise. */
export function verifyGuestToken(token: string): string | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8'),
    ) as GuestPayload;

    if (decoded.type !== 'guest' || !decoded.sub) {
      return null;
    }

    if (typeof decoded.exp === 'number' && Date.now() > decoded.exp) {
      return null;
    }

    return decoded.sub;
  } catch {
    return null;
  }
}
