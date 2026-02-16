import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  GameCatalogEntryDto,
  CreateGameBody,
  PatchGameBody,
} from '../types/game.types.js';
import { logger } from '../logger/logger.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const catalogPath = path.resolve(currentDir, '../data/games_catalog.json');

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

/** Get all enabled games (public). */
export async function getAllGames(): Promise<GameCatalogEntryDto[]> {
  const entries = await ensureAndRead();
  return entries.filter((e) => e.enabled);
}

/** Get single game by id (public). */
export async function getGameById(gameId: string): Promise<GameCatalogEntryDto | null> {
  const entries = await ensureAndRead();
  return entries.find((e) => e.gameId === gameId && e.enabled) ?? null;
}

/** Get all games including disabled (admin). */
export async function getAllGamesAdmin(): Promise<GameCatalogEntryDto[]> {
  return ensureAndRead();
}

/** Create game (admin). Returns null if gameId exists. */
export async function createGame(body: CreateGameBody): Promise<GameCatalogEntryDto | null> {
  return enqueue(async () => {
    const entries = await ensureAndRead();
    if (entries.some((e) => e.gameId === body.gameId)) return null;
    const now = new Date().toISOString();
    const entry: GameCatalogEntryDto = {
      gameId: body.gameId,
      slug: body.slug,
      title: body.title,
      category: body.category,
      coverImageUrl: body.coverImageUrl,
      coinCost: body.coinCost,
      rewardCoins: body.rewardCoins,
      totalLevels: body.totalLevels,
      enabled: body.enabled ?? true,
      updatedAt: now,
      rating: body.rating,
      players: body.players,
      isHot: body.isHot,
      isPick: body.isPick,
    };
    entries.push(entry);
    await writeCatalog(entries);
    logger.info('game created', { gameId: body.gameId, requestId: (global as unknown as { requestId?: string }).requestId });
    return entry;
  });
}

/** Patch game (admin). Returns null if not found. */
export async function patchGame(
  gameId: string,
  body: PatchGameBody,
): Promise<GameCatalogEntryDto | null> {
  return enqueue(async () => {
    const entries = await ensureAndRead();
    const idx = entries.findIndex((e) => e.gameId === gameId);
    if (idx < 0) return null;
    const now = new Date().toISOString();
    entries[idx] = { ...entries[idx], ...body, updatedAt: now };
    await writeCatalog(entries);
    logger.info('game patched', { gameId, requestId: (global as unknown as { requestId?: string }).requestId });
    return entries[idx];
  });
}
