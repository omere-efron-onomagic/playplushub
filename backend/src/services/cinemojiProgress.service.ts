import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CinemojiMode } from '../types/cinemoji.types.js';

type ActorType = 'user' | 'guest';

type ProgressRecord = {
  actorId: string;
  actorType: ActorType;
  mode1CompletedStages: number[];
  mode2CompletedStages: number[];
  updatedAt: string;
};

type StageProgress = {
  mode1CompletedStages: number[];
  mode2CompletedStages: number[];
};

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const progressFilePath = path.resolve(currentDir, '../data/cinemoji_progress.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureProgressFile(): Promise<void> {
  await mkdir(path.dirname(progressFilePath), { recursive: true });
  try {
    await readFile(progressFilePath, 'utf-8');
  } catch {
    await writeFile(progressFilePath, '[]', 'utf-8');
  }
}

async function readProgressRecords(): Promise<ProgressRecord[]> {
  await ensureProgressFile();
  const raw = await readFile(progressFilePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as ProgressRecord[]) : [];
}

async function writeProgressRecords(records: ProgressRecord[]): Promise<void> {
  await writeFile(progressFilePath, JSON.stringify(records, null, 2), 'utf-8');
}

function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function getActorType(isGuest: boolean): ActorType {
  return isGuest ? 'guest' : 'user';
}

function sanitizeStages(stages: number[]): number[] {
  return Array.from(new Set(stages.filter((value) => Number.isInteger(value) && value > 0))).sort(
    (a, b) => a - b,
  );
}

export async function getCinemojiProgress(actorId: string, isGuest: boolean): Promise<StageProgress> {
  const records = await readProgressRecords();
  const actorType = getActorType(isGuest);
  const record = records.find((entry) => entry.actorId === actorId && entry.actorType === actorType);
  if (!record) {
    return {
      mode1CompletedStages: [],
      mode2CompletedStages: [],
    };
  }

  return {
    mode1CompletedStages: sanitizeStages(record.mode1CompletedStages),
    mode2CompletedStages: sanitizeStages(record.mode2CompletedStages),
  };
}

export async function markCinemojiStageCompleted(
  actorId: string,
  isGuest: boolean,
  mode: CinemojiMode,
  stage: number,
): Promise<StageProgress> {
  return enqueueWrite(async () => {
    const records = await readProgressRecords();
    const actorType = getActorType(isGuest);
    const index = records.findIndex((entry) => entry.actorId === actorId && entry.actorType === actorType);
    const now = new Date().toISOString();

    if (index < 0) {
      const created: ProgressRecord = {
        actorId,
        actorType,
        mode1CompletedStages: mode === 'mode1' ? [stage] : [],
        mode2CompletedStages: mode === 'mode2' ? [stage] : [],
        updatedAt: now,
      };
      records.push(created);
      await writeProgressRecords(records);
      return {
        mode1CompletedStages: created.mode1CompletedStages,
        mode2CompletedStages: created.mode2CompletedStages,
      };
    }

    const current = records[index];
    if (!current) {
      return { mode1CompletedStages: [], mode2CompletedStages: [] };
    }

    if (mode === 'mode1') {
      current.mode1CompletedStages = sanitizeStages([...current.mode1CompletedStages, stage]);
    } else {
      current.mode2CompletedStages = sanitizeStages([...current.mode2CompletedStages, stage]);
    }
    current.updatedAt = now;
    records[index] = current;
    await writeProgressRecords(records);
    return {
      mode1CompletedStages: current.mode1CompletedStages,
      mode2CompletedStages: current.mode2CompletedStages,
    };
  });
}
