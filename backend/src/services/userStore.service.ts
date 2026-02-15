import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger/logger.js';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
};

type CreateStoredUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const usersFilePath = path.resolve(currentDir, '../data/users.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataFile(): Promise<void> {
  const dirPath = path.dirname(usersFilePath);
  await mkdir(dirPath, { recursive: true });
  try {
    await readFile(usersFilePath, 'utf-8');
  } catch {
    logger.debug('users.json not found, initializing empty');
    await writeFile(usersFilePath, '[]', 'utf-8');
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureDataFile();
  const fileContent = await readFile(usersFilePath, 'utf-8');
  const parsed = JSON.parse(fileContent) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed as StoredUser[];
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  const payload = JSON.stringify(users, null, 2);
  await writeFile(usersFilePath, payload, 'utf-8');
}

function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((item) => item.email === normalizedEmail);
  return user ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await readUsers();
  const user = users.find((item) => item.id === id);
  return user ?? null;
}

export async function createStoredUser(input: CreateStoredUserInput): Promise<StoredUser> {
  return enqueueWrite(async () => {
    const users = await readUsers();
    const normalizedEmail = input.email.trim().toLowerCase();

    const alreadyExists = users.some((item) => item.email === normalizedEmail);
    if (alreadyExists) {
      throw new Error('email_exists');
    }

    const now = new Date().toISOString();
    const createdUser: StoredUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash: input.passwordHash,
      coins: 0,
      createdAt: now,
      updatedAt: now,
    };

    users.push(createdUser);
    await writeUsers(users);
    return createdUser;
  });
}

export async function addCoinsToUser(userId: string, coinsToAdd: number): Promise<StoredUser | null> {
  return enqueueWrite(async () => {
    const users = await readUsers();
    const userIndex = users.findIndex((item) => item.id === userId);

    if (userIndex < 0) {
      return null;
    }

    const user = users[userIndex];
    if (!user) {
      return null;
    }

    user.coins += coinsToAdd;
    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;
    await writeUsers(users);
    return user;
  });
}

/** Deduct coins from user. Throws 'insufficient_funds' if balance would go negative. */
export async function deductCoinsFromUser(
  userId: string,
  amount: number,
): Promise<StoredUser | null> {
  return enqueueWrite(async () => {
    const users = await readUsers();
    const userIndex = users.findIndex((item) => item.id === userId);

    if (userIndex < 0) return null;

    const user = users[userIndex];
    if (!user) return null;

    if (user.coins < amount) {
      throw new Error('insufficient_funds');
    }

    user.coins -= amount;
    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;
    await writeUsers(users);
    return user;
  });
}
