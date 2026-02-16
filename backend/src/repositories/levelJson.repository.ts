import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { LinkFourLevelDto } from '../types/game.types.js';
import { logger } from '../logger/logger.js';
import { resolveDataFilePath } from '../config/storagePaths.js';

const levelsPath = resolveDataFilePath('link_four_levels.json');
let writeQueue: Promise<void> = Promise.resolve();

async function ensureAndRead(): Promise<LinkFourLevelDto[]> {
  try {
    const content = await readFile(levelsPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as LinkFourLevelDto[];
  } catch {
    logger.debug('link_four_levels.json not found or invalid, starting empty');
    return [];
  }
}

async function writeLevels(entries: LinkFourLevelDto[]): Promise<void> {
  await mkdir(path.dirname(levelsPath), { recursive: true });
  await writeFile(levelsPath, JSON.stringify(entries, null, 2), 'utf-8');
}

function enqueue<T>(op: () => Promise<T>): Promise<T> {
  const p = writeQueue.then(op);
  writeQueue = p.then(() => undefined, () => undefined);
  return p;
}

export async function jsonGetAllLevels(): Promise<LinkFourLevelDto[]> {
  return ensureAndRead();
}

export async function jsonUpsertLevels(
  gameId: string,
  levels: LinkFourLevelDto[],
): Promise<LinkFourLevelDto[]> {
  return enqueue(async () => {
    const all = await ensureAndRead();
    const filtered = all.filter((e) => e.gameId !== gameId);
    const merged = [...filtered, ...levels];
    await writeLevels(merged);
    return levels.sort((a, b) => a.level - b.level);
  });
}
