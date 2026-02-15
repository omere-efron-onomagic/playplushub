import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const claimedPath = path.resolve(currentDir, '../../data/claimed_sessions.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureFile(): Promise<void> {
  const dirPath = path.dirname(claimedPath);
  await mkdir(dirPath, { recursive: true });
}

async function readClaimed(): Promise<Set<string>> {
  await ensureFile();
  try {
    const raw = await readFile(claimedPath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/** Returns true if session was not yet claimed and is now marked; false if already claimed. */
export async function tryClaim(sessionId: string): Promise<boolean> {
  const run = async (): Promise<boolean> => {
    const claimed = await readClaimed();
    if (claimed.has(sessionId)) return false;
    claimed.add(sessionId);
    await writeFile(claimedPath, JSON.stringify([...claimed], null, 2), 'utf-8');
    return true;
  };

  const result = writeQueue.then(run);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}
