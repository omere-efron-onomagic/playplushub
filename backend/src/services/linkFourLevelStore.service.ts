import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LinkFourLevelDto } from '../types/game.types.js';
import { logger } from '../logger/logger.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const levelsPath = path.resolve(currentDir, '../data/link_four_levels.json');

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

/** Get enabled levels for a game (public). */
export async function getLevelsForGame(gameId: string): Promise<LinkFourLevelDto[]> {
  const entries = await ensureAndRead();
  return entries
    .filter((e) => e.gameId === gameId && e.enabled)
    .sort((a, b) => a.level - b.level);
}

/** Get rounds for a game (public). Returns unique roundIds with their levels. */
export async function getRoundsForGame(gameId: string): Promise<Map<string, LinkFourLevelDto[]>> {
  const entries = await ensureAndRead();
  const byRound = new Map<string, LinkFourLevelDto[]>();
  for (const e of entries) {
    if (e.gameId !== gameId || !e.enabled) continue;
    const roundId = e.roundId ?? `round-${Math.ceil(e.level / 2)}`;
    const list = byRound.get(roundId) ?? [];
    list.push(e);
    byRound.set(roundId, list);
  }
  for (const list of byRound.values()) {
    list.sort((a, b) => a.level - b.level);
  }
  return byRound;
}

/** Get levels for a specific round (public). */
export async function getLevelsForRound(
  gameId: string,
  roundId: string,
): Promise<LinkFourLevelDto[]> {
  const entries = await ensureAndRead();
  return entries
    .filter((e) => e.gameId === gameId && e.roundId === roundId && e.enabled)
    .sort((a, b) => a.level - b.level);
}

/** Upsert levels for a game (admin). Replaces existing levels for that game. */
export async function upsertLevels(
  gameId: string,
  levels: Array<{
    roundId: string;
    level: number;
    answer: string;
    images: [string, string, string, string];
    extraLetters: string;
    enabled?: boolean;
  }>,
): Promise<LinkFourLevelDto[]> {
  return enqueue(async () => {
    const all = await ensureAndRead();
    const filtered = all.filter((e) => e.gameId !== gameId);
    const newLevels: LinkFourLevelDto[] = levels.map((l) => ({
      gameId,
      roundId: l.roundId,
      level: l.level,
      answer: l.answer,
      images: l.images,
      extraLetters: l.extraLetters,
      enabled: l.enabled ?? true,
    }));
    const merged = [...filtered, ...newLevels];
    await writeLevels(merged);
    logger.info('levels upserted', {
      gameId,
      count: newLevels.length,
      requestId: (global as unknown as { requestId?: string }).requestId,
    });
    return newLevels.sort((a, b) => a.level - b.level);
  });
}

/** Create round with levels; extraLetters auto-generated. */
export async function createRound(
  gameId: string,
  roundId: string,
  levels: Array<{ answer: string; images: [string, string, string, string] }>,
): Promise<LinkFourLevelDto[]> {
  const { generateExtraLetters } = await import('./extraLetters.service.js');
  const existing = await ensureAndRead();
  const gameLevels = existing.filter((e) => e.gameId === gameId && e.roundId !== roundId);
  const maxLevel = gameLevels.reduce((m, e) => Math.max(m, e.level), 0);
  const newLevels: LinkFourLevelDto[] = levels.map((l, i) => ({
    gameId,
    roundId,
    level: maxLevel + i + 1,
    answer: l.answer.trim().toUpperCase(),
    images: l.images,
    extraLetters: generateExtraLetters(l.answer),
    enabled: true,
  }));
  const merged = [...gameLevels, ...newLevels].map((e) => ({
    roundId: e.roundId ?? `round-${Math.ceil(e.level / 2)}`,
    level: e.level,
    answer: e.answer,
    images: e.images,
    extraLetters: e.extraLetters,
    enabled: e.enabled ?? true,
  }));
  return upsertLevels(gameId, merged);
}
