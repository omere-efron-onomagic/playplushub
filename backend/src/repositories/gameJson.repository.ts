import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { GameCatalogEntryDto } from '../types/game.types.js';
import { logger } from '../logger/logger.js';
import { resolveDataFilePath } from '../config/storagePaths.js';

const catalogPath = resolveDataFilePath('games_catalog.json');
let writeQueue: Promise<void> = Promise.resolve();

async function ensureAndRead(): Promise<GameCatalogEntryDto[]> {
  try {
    const content = await readFile(catalogPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as GameCatalogEntryDto[];
  } catch {
    logger.debug('games_catalog.json not found or invalid, starting empty');
    return [];
  }
}

async function writeCatalog(entries: GameCatalogEntryDto[]): Promise<void> {
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, JSON.stringify(entries, null, 2), 'utf-8');
}

function enqueue<T>(op: () => Promise<T>): Promise<T> {
  const p = writeQueue.then(op);
  writeQueue = p.then(() => undefined, () => undefined);
  return p;
}

export async function jsonGetAllGames(): Promise<GameCatalogEntryDto[]> {
  return ensureAndRead();
}

export async function jsonCreateGame(
  entry: GameCatalogEntryDto,
): Promise<GameCatalogEntryDto | null> {
  return enqueue(async () => {
    const entries = await ensureAndRead();
    if (entries.some((e) => e.gameId === entry.gameId)) return null;
    entries.push(entry);
    await writeCatalog(entries);
    return entry;
  });
}

export async function jsonPatchGame(
  gameId: string,
  updates: Partial<GameCatalogEntryDto>,
): Promise<GameCatalogEntryDto | null> {
  return enqueue(async () => {
    const entries = await ensureAndRead();
    const idx = entries.findIndex((e) => e.gameId === gameId);
    if (idx < 0) return null;
    entries[idx] = { ...entries[idx], ...updates };
    await writeCatalog(entries);
    return entries[idx];
  });
}
