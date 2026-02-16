import type {
  GameCatalogEntryDto,
  CreateGameBody,
  PatchGameBody,
} from '../types/game.types.js';
import { logger } from '../logger/logger.js';
import { getContentStoreDriver, getSupabaseClient } from '../config/supabase.js';
import * as jsonRepo from '../repositories/gameJson.repository.js';
import * as supabaseRepo from '../repositories/gameSupabase.repository.js';

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

/** Get all enabled games (public). */
export async function getAllGames(): Promise<GameCatalogEntryDto[]> {
  if (useSupabase() && getSupabaseClient()) {
    try {
      const rows = await supabaseRepo.supabaseGetAllGames();
      const supabaseEnabled = rows.filter((e) => e.enabled);
      if (useJson(true)) {
        const jsonEnabled = (await jsonRepo.jsonGetAllGames()).filter((e) => e.enabled);
        const merged = [...supabaseEnabled];
        for (const entry of jsonEnabled) {
          if (!merged.some((item) => item.gameId === entry.gameId)) {
            merged.push(entry);
          }
        }
        return merged;
      }
      return supabaseEnabled;
    } catch (err) {
      logger.warn('supabase getAllGames failed, falling back', { err });
      if (useJson(true)) {
        const entries = await jsonRepo.jsonGetAllGames();
        return entries.filter((e) => e.enabled);
      }
      throw err;
    }
  }
  const entries = await jsonRepo.jsonGetAllGames();
  return entries.filter((e) => e.enabled);
}

/** Get single game by id (public). */
export async function getGameById(
  gameId: string,
): Promise<GameCatalogEntryDto | null> {
  if (useSupabase() && getSupabaseClient()) {
    try {
      const row = await supabaseRepo.supabaseGetGameById(gameId);
      if (row?.enabled) {
        return row;
      }
      if (useJson(true)) {
        const entries = await jsonRepo.jsonGetAllGames();
        return entries.find((e) => e.gameId === gameId && e.enabled) ?? null;
      }
      return null;
    } catch (err) {
      logger.warn('supabase getGameById failed, falling back', { err, gameId });
      if (useJson(true)) {
        const entries = await jsonRepo.jsonGetAllGames();
        return entries.find((e) => e.gameId === gameId && e.enabled) ?? null;
      }
      throw err;
    }
  }
  const entries = await jsonRepo.jsonGetAllGames();
  return entries.find((e) => e.gameId === gameId && e.enabled) ?? null;
}

/** Get all games including disabled (admin). */
export async function getAllGamesAdmin(): Promise<GameCatalogEntryDto[]> {
  if (useSupabase() && getSupabaseClient()) {
    try {
      return supabaseRepo.supabaseGetAllGames();
    } catch (err) {
      logger.warn('supabase getAllGamesAdmin failed, falling back', { err });
      if (useJson(true)) return jsonRepo.jsonGetAllGames();
      throw err;
    }
  }
  return jsonRepo.jsonGetAllGames();
}

/** Create game (admin). Returns null if gameId exists. */
export async function createGame(
  body: CreateGameBody,
): Promise<GameCatalogEntryDto | null> {
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
  if (useSupabase() && getSupabaseClient()) {
    try {
      const result = await supabaseRepo.supabaseCreateGame(entry);
      if (result) {
        logger.info('game created', {
          gameId: body.gameId,
          requestId: (global as unknown as { requestId?: string }).requestId,
        });
      }
      return result;
    } catch (err) {
      logger.error('supabase createGame failed', { err, gameId: body.gameId });
      throw err;
    }
  }
  const result = await jsonRepo.jsonCreateGame(entry);
  if (result) {
    logger.info('game created', {
      gameId: body.gameId,
      requestId: (global as unknown as { requestId?: string }).requestId,
    });
  }
  return result;
}

/** Patch game (admin). Returns null if not found. */
export async function patchGame(
  gameId: string,
  body: PatchGameBody,
): Promise<GameCatalogEntryDto | null> {
  const updates = { ...body, updatedAt: new Date().toISOString() };
  if (useSupabase() && getSupabaseClient()) {
    try {
      const result = await supabaseRepo.supabasePatchGame(gameId, updates);
      if (result) {
        logger.info('game patched', {
          gameId,
          requestId: (global as unknown as { requestId?: string }).requestId,
        });
      }
      return result;
    } catch (err) {
      logger.error('supabase patchGame failed', { err, gameId });
      throw err;
    }
  }
  const result = await jsonRepo.jsonPatchGame(gameId, updates);
  if (result) {
    logger.info('game patched', {
      gameId,
      requestId: (global as unknown as { requestId?: string }).requestId,
    });
  }
  return result;
}

/**
 * Ensures Supabase games table contains all JSON catalog entries.
 * Used at startup to keep dual/supabase environments in sync.
 */
export async function syncJsonCatalogToSupabase(): Promise<{ synced: boolean; count: number }> {
  if (!useSupabase() || !getSupabaseClient()) {
    return { synced: false, count: 0 };
  }

  const jsonEntries = await jsonRepo.jsonGetAllGames();
  if (jsonEntries.length === 0) {
    return { synced: false, count: 0 };
  }

  const count = await supabaseRepo.supabaseUpsertGames(jsonEntries);
  logger.info('games catalog synced to supabase', { count });
  return { synced: true, count };
}
