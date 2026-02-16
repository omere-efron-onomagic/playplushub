import type { GameCatalogEntryDto } from '../types/game.types.js';
import { getSupabaseClient } from '../config/supabase.js';
import { logger } from '../logger/logger.js';

const GAMES_TABLE = 'games';

type DbRow = {
  game_id: string;
  slug: string;
  title: string;
  category: string;
  cover_image_url: string;
  coin_cost: number;
  reward_coins: number;
  total_levels?: number;
  total_rounds?: number;
  levels_per_round?: number;
  enabled: boolean;
  updated_at: string;
  rating?: number;
  players?: string;
  is_hot?: boolean;
  is_pick?: boolean;
};

function toDto(row: DbRow): GameCatalogEntryDto {
  return {
    gameId: row.game_id,
    slug: row.slug,
    title: row.title,
    category: row.category as GameCatalogEntryDto['category'],
    coverImageUrl: row.cover_image_url,
    coinCost: row.coin_cost,
    rewardCoins: row.reward_coins,
    totalLevels: row.total_levels,
    totalRounds: row.total_rounds,
    levelsPerRound: row.levels_per_round,
    enabled: row.enabled,
    updatedAt: row.updated_at,
    rating: row.rating,
    players: row.players,
    isHot: row.is_hot,
    isPick: row.is_pick,
  };
}

function toRow(dto: GameCatalogEntryDto): DbRow {
  return {
    game_id: dto.gameId,
    slug: dto.slug,
    title: dto.title,
    category: dto.category,
    cover_image_url: dto.coverImageUrl,
    coin_cost: dto.coinCost,
    reward_coins: dto.rewardCoins,
    total_levels: dto.totalLevels,
    total_rounds: dto.totalRounds,
    levels_per_round: dto.levelsPerRound,
    enabled: dto.enabled,
    updated_at: dto.updatedAt,
    rating: dto.rating,
    players: dto.players,
    is_hot: dto.isHot,
    is_pick: dto.isPick,
  };
}

export async function supabaseGetAllGames(): Promise<GameCatalogEntryDto[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from(GAMES_TABLE).select('*');
  if (error) {
    logger.error('supabase_get_all_games failed', { err: error });
    throw error;
  }
  return (data ?? []).map((r: DbRow) => toDto(r));
}

export async function supabaseGetGameById(
  gameId: string,
): Promise<GameCatalogEntryDto | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const res = await client
    .from(GAMES_TABLE)
    .select('*')
    .eq('game_id', gameId)
    .maybeSingle();
  if (res.error) {
    logger.error('supabase_get_game_by_id failed', { err: res.error, gameId });
    throw res.error;
  }
  return res.data ? toDto(res.data as DbRow) : null;
}

export async function supabaseCreateGame(
  entry: GameCatalogEntryDto,
): Promise<GameCatalogEntryDto | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const res = await client
    .from(GAMES_TABLE)
    .insert(toRow(entry))
    .select()
    .maybeSingle();
  if (res.error) {
    if (res.error.code === '23505') return null; // unique violation
    logger.error('supabase_create_game failed', { err: res.error, gameId: entry.gameId });
    throw res.error;
  }
  return res.data ? toDto(res.data as DbRow) : null;
}

export async function supabasePatchGame(
  gameId: string,
  updates: Partial<GameCatalogEntryDto>,
): Promise<GameCatalogEntryDto | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const row: Partial<DbRow> = {};
  if (updates.slug !== undefined) row.slug = updates.slug;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.coverImageUrl !== undefined) row.cover_image_url = updates.coverImageUrl;
  if (updates.coinCost !== undefined) row.coin_cost = updates.coinCost;
  if (updates.rewardCoins !== undefined) row.reward_coins = updates.rewardCoins;
  if (updates.totalLevels !== undefined) row.total_levels = updates.totalLevels;
  if (updates.enabled !== undefined) row.enabled = updates.enabled;
  if (updates.rating !== undefined) row.rating = updates.rating;
  if (updates.players !== undefined) row.players = updates.players;
  if (updates.isHot !== undefined) row.is_hot = updates.isHot;
  if (updates.isPick !== undefined) row.is_pick = updates.isPick;
  row.updated_at = new Date().toISOString();
  const res = await client
    .from(GAMES_TABLE)
    .update(row)
    .eq('game_id', gameId)
    .select()
    .maybeSingle();
  if (res.error) {
    logger.error('supabase_patch_game failed', { err: res.error, gameId });
    throw res.error;
  }
  return res.data ? toDto(res.data as DbRow) : null;
}

export async function supabaseUpsertGames(entries: GameCatalogEntryDto[]): Promise<number> {
  const client = getSupabaseClient();
  if (!client || entries.length === 0) return 0;
  const rows = entries.map(toRow);
  const { error } = await client
    .from(GAMES_TABLE)
    .upsert(rows, { onConflict: 'game_id', ignoreDuplicates: false });
  if (error) {
    logger.error('supabase_upsert_games failed', { err: error, count: entries.length });
    throw error;
  }
  return rows.length;
}
