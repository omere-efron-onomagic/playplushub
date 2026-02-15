import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SALT_SIZE = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_SIZE).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPasswordHash: string): boolean {
  const [salt, expectedHash] = storedPasswordHash.split(':');
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const actualBuffer = Buffer.from(actualHash, 'hex');

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
