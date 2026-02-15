import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GuestRecord, MigrationResult } from '../types/user.types.js';
import { addCoinsToUser } from './userStore.service.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const guestsFilePath = path.resolve(currentDir, '../data/guests.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataFile(): Promise<void> {
  const dirPath = path.dirname(guestsFilePath);
  await mkdir(dirPath, { recursive: true });
  try {
    await readFile(guestsFilePath, 'utf-8');
  } catch {
    await writeFile(guestsFilePath, '[]', 'utf-8');
  }
}

async function readGuests(): Promise<GuestRecord[]> {
  await ensureDataFile();
  const fileContent = await readFile(guestsFilePath, 'utf-8');
  const parsed = JSON.parse(fileContent) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed as GuestRecord[];
}

async function writeGuests(guests: GuestRecord[]): Promise<void> {
  const payload = JSON.stringify(guests, null, 2);
  await writeFile(guestsFilePath, payload, 'utf-8');
}

function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function createGuestRecord(): Promise<GuestRecord> {
  return enqueueWrite(async () => {
    const guests = await readGuests();
    const now = new Date().toISOString();

    const guest: GuestRecord = {
      id: randomUUID(),
      coins: 0,
      createdAt: now,
      updatedAt: now,
      migratedTo: null,
    };

    guests.push(guest);
    await writeGuests(guests);
    return guest;
  });
}

export async function findGuestById(id: string): Promise<GuestRecord | null> {
  const guests = await readGuests();
  return guests.find((g) => g.id === id) ?? null;
}

export async function addCoinsToGuest(
  guestId: string,
  coinsToAdd: number,
): Promise<GuestRecord | null> {
  return enqueueWrite(async () => {
    const guests = await readGuests();
    const idx = guests.findIndex((g) => g.id === guestId);
    if (idx < 0) return null;

    const guest = guests[idx];
    if (!guest || guest.migratedTo) return null;

    guest.coins += coinsToAdd;
    guest.updatedAt = new Date().toISOString();
    guests[idx] = guest;
    await writeGuests(guests);
    return guest;
  });
}

/**
 * Idempotent guest-to-account migration.
 * Transfers guest coins to the target account, then marks the guest as migrated.
 * Uses `account_wins` conflict resolution: account values are authoritative for
 * non-additive fields; coins are additively transferred.
 * Repeated calls return `noop` once the guest is already migrated.
 */
export async function migrateGuestToAccount(
  guestId: string,
  accountId: string,
): Promise<MigrationResult> {
  return enqueueWrite(async () => {
    const guests = await readGuests();
    const idx = guests.findIndex((g) => g.id === guestId);
    if (idx < 0) {
      return { status: 'not_found', coinsTransferred: 0 };
    }

    const guest = guests[idx];
    if (!guest) {
      return { status: 'not_found', coinsTransferred: 0 };
    }

    if (guest.migratedTo) {
      return { status: 'noop', coinsTransferred: 0 };
    }

    const coinsToTransfer = guest.coins;

    if (coinsToTransfer > 0) {
      const updated = await addCoinsToUser(accountId, coinsToTransfer);
      if (!updated) {
        return { status: 'not_found', coinsTransferred: 0 };
      }
    }

    guest.migratedTo = accountId;
    guest.coins = 0;
    guest.updatedAt = new Date().toISOString();
    guests[idx] = guest;
    await writeGuests(guests);

    return { status: 'applied', coinsTransferred: coinsToTransfer };
  });
}
