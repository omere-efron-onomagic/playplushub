import type { LinkFourLevelDto } from '../types/game.types.js';
import { logger } from '../logger/logger.js';
import { getContentStoreDriver, getSupabaseClient } from '../config/supabase.js';
import * as jsonRepo from '../repositories/levelJson.repository.js';
import * as supabaseRepo from '../repositories/levelSupabase.repository.js';

function useSupabase(): boolean {
  const driver = getContentStoreDriver();
  return driver === 'supabase' || driver === 'dual';
}

function useJson(driverFallback: boolean): boolean {
  const driver = getContentStoreDriver();
  if (driver === 'json') return true;
  if (driver === 'dual' && driverFallback) return true;
  return false;
}

async function getAllLevels(): Promise<LinkFourLevelDto[]> {
  if (useSupabase() && getSupabaseClient()) {
    try {
      return supabaseRepo.supabaseGetAllLevels();
    } catch (err) {
      logger.warn('supabase getAllLevels failed, falling back', { err });
      if (useJson(true)) return jsonRepo.jsonGetAllLevels();
      throw err;
    }
  }
  return jsonRepo.jsonGetAllLevels();
}

/** Get enabled levels for a game (public). */
export async function getLevelsForGame(
  gameId: string,
): Promise<LinkFourLevelDto[]> {
  if (useSupabase() && getSupabaseClient()) {
    try {
      return supabaseRepo.supabaseGetLevelsByGame(gameId, true);
    } catch (err) {
      logger.warn('supabase getLevelsForGame failed, falling back', { err, gameId });
      if (useJson(true)) {
        const entries = await jsonRepo.jsonGetAllLevels();
        return entries
          .filter((e) => e.gameId === gameId && e.enabled)
          .sort((a, b) => a.level - b.level);
      }
      throw err;
    }
  }
  const entries = await jsonRepo.jsonGetAllLevels();
  return entries
    .filter((e) => e.gameId === gameId && e.enabled)
    .sort((a, b) => a.level - b.level);
}

/** Get rounds for a game (public). Returns unique roundIds with their levels. */
export async function getRoundsForGame(
  gameId: string,
): Promise<Map<string, LinkFourLevelDto[]>> {
  const loadLevels = async (): Promise<LinkFourLevelDto[]> => {
    if (useSupabase() && getSupabaseClient()) {
      try {
        return await supabaseRepo.supabaseGetLevelsByGame(gameId, true);
      } catch (err) {
        logger.warn('supabase getRoundsForGame failed, falling back', { err });
        if (useJson(true)) {
          const all = await jsonRepo.jsonGetAllLevels();
          return all
            .filter((e) => e.gameId === gameId && e.enabled)
            .sort((a, b) => a.level - b.level);
        }
        throw err;
      }
    }
    const all = await jsonRepo.jsonGetAllLevels();
    return all
      .filter((e) => e.gameId === gameId && e.enabled)
      .sort((a, b) => a.level - b.level);
  };
  const entries = await loadLevels();
  const byRound = new Map<string, LinkFourLevelDto[]>();
  for (const e of entries) {
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
  const entries = await getAllLevels();
  return entries
    .filter((e) => e.gameId === gameId && e.roundId === roundId && e.enabled)
    .sort((a, b) => a.level - b.level);
}

/** Upsert levels for a game (admin). Replaces existing levels for that game. */
export async function upsertLevels(
  gameId: string,
  levels: {
    roundId: string;
    level: number;
    answer: string;
    images: [string, string, string, string];
    extraLetters: string;
    enabled?: boolean;
  }[],
): Promise<LinkFourLevelDto[]> {
  const newLevels: LinkFourLevelDto[] = levels.map((l) => ({
    gameId,
    roundId: l.roundId,
    level: l.level,
    answer: l.answer,
    images: l.images,
    extraLetters: l.extraLetters,
    enabled: l.enabled ?? true,
  }));
  if (useSupabase() && getSupabaseClient()) {
    try {
      const result = await supabaseRepo.supabaseUpsertLevels(gameId, newLevels);
      logger.info('levels upserted', {
        gameId,
        count: newLevels.length,
        requestId: (global as unknown as { requestId?: string }).requestId,
      });
      return result;
    } catch (err) {
      logger.error('supabase upsertLevels failed', { err, gameId });
      throw err;
    }
  }
  const result = await jsonRepo.jsonUpsertLevels(gameId, newLevels);
  logger.info('levels upserted', {
    gameId,
    count: newLevels.length,
    requestId: (global as unknown as { requestId?: string }).requestId,
  });
  return result;
}

/** Create round with levels; extraLetters auto-generated. Atomic for Supabase. */
export async function createRound(
  gameId: string,
  roundId: string,
  levels: { answer: string; images: [string, string, string, string] }[],
): Promise<LinkFourLevelDto[]> {
  const { generateExtraLetters } = await import('./extraLetters.service.js');
  const existing = await getAllLevels();
  const gameLevels = existing.filter(
    (e) => e.gameId === gameId && e.roundId !== roundId,
  );
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
