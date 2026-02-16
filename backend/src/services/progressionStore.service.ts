import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type ProgressionRecord = {
  actorId: string;
  actorType: 'user' | 'guest';
  gameId: string;
  roundId: string;
};

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const progressionPath = path.resolve(currentDir, '../data/round_progression.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureAndRead(): Promise<ProgressionRecord[]> {
  try {
    const content = await readFile(progressionPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ProgressionRecord[];
  } catch {
    return [];
  }
}

async function writeRecords(records: ProgressionRecord[]): Promise<void> {
  await mkdir(path.dirname(progressionPath), { recursive: true });
  await writeFile(progressionPath, JSON.stringify(records, null, 2), 'utf-8');
}

function enqueue<T>(op: () => Promise<T>): Promise<T> {
  const p = writeQueue.then(op);
  writeQueue = p.then(() => undefined, () => undefined);
  return p;
}

export async function getCompletedRounds(
  actorId: string,
  actorType: 'user' | 'guest',
  gameId: string,
): Promise<string[]> {
  const records = await ensureAndRead();
  const roundIds = records
    .filter(
      (r) =>
        r.actorId === actorId &&
        r.actorType === actorType &&
        r.gameId === gameId,
    )
    .map((r) => r.roundId);
  return [...new Set(roundIds)];
}

export async function hasCompletedRound(
  actorId: string,
  actorType: 'user' | 'guest',
  gameId: string,
  roundId: string,
): Promise<boolean> {
  const completed = await getCompletedRounds(actorId, actorType, gameId);
  return completed.includes(roundId);
}

export async function markRoundComplete(
  actorId: string,
  actorType: 'user' | 'guest',
  gameId: string,
  roundId: string,
): Promise<void> {
  await enqueue(async () => {
    const records = await ensureAndRead();
    const exists = records.some(
      (r) =>
        r.actorId === actorId &&
        r.actorType === actorType &&
        r.gameId === gameId &&
        r.roundId === roundId,
    );
    if (exists) return;
    records.push({ actorId, actorType, gameId, roundId });
    await writeRecords(records);
  });
}
