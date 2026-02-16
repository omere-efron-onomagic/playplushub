import type { LinkFourLevelDto } from '../types/game.types.js';
import { getSupabaseClient } from '../config/supabase.js';
import { logger } from '../logger/logger.js';

const LEVELS_TABLE = 'link_four_levels';

type DbRow = {
  game_id: string;
  round_id: string | null;
  level: number;
  answer: string;
  images: string[];
  extra_letters: string;
  enabled: boolean;
};

function toDto(row: DbRow): LinkFourLevelDto {
  const imgs = row.images;
  const images: [string, string, string, string] = [
    imgs[0] ?? '',
    imgs[1] ?? '',
    imgs[2] ?? '',
    imgs[3] ?? '',
  ];
  return {
    gameId: row.game_id,
    roundId: row.round_id ?? undefined,
    level: row.level,
    answer: row.answer,
    images,
    extraLetters: row.extra_letters,
    enabled: row.enabled,
  };
}

function toRow(dto: LinkFourLevelDto): DbRow {
  return {
    game_id: dto.gameId,
    round_id: dto.roundId ?? null,
    level: dto.level,
    answer: dto.answer,
    images: [...dto.images],
    extra_letters: dto.extraLetters,
    enabled: dto.enabled,
  };
}

export async function supabaseGetAllLevels(): Promise<LinkFourLevelDto[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from(LEVELS_TABLE).select('*');
  if (error) {
    logger.error('supabase_get_all_levels failed', { err: error });
    throw error;
  }
  return (data ?? []).map((r) => toDto(r as DbRow));
}

export async function supabaseGetLevelsByGame(
  gameId: string,
  enabledOnly: boolean,
): Promise<LinkFourLevelDto[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  let q = client.from(LEVELS_TABLE).select('*').eq('game_id', gameId);
  if (enabledOnly) q = q.eq('enabled', true);
  const { data, error } = await q.order('level', { ascending: true });
  if (error) {
    logger.error('supabase_get_levels_by_game failed', { err: error, gameId });
    throw error;
  }
  return (data ?? []).map((r) => toDto(r as DbRow));
}

/** Replace all levels for a game. Atomic: delete then insert. */
export async function supabaseUpsertLevels(
  gameId: string,
  levels: LinkFourLevelDto[],
): Promise<LinkFourLevelDto[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { error: delError } = await client
    .from(LEVELS_TABLE)
    .delete()
    .eq('game_id', gameId);
  if (delError) {
    logger.error('supabase_delete_levels failed', { err: delError, gameId });
    throw delError;
  }
  if (levels.length === 0) return [];
  const rows = levels.map((l) => toRow(l));
  const { data, error } = await client
    .from(LEVELS_TABLE)
    .insert(rows)
    .select('*');
  if (error) {
    logger.error('supabase_insert_levels failed', { err: error, gameId });
    throw error;
  }
  return (data ?? []).map((r) => toDto(r as DbRow)).sort((a, b) => a.level - b.level);
}
