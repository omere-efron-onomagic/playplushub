import { getSupabaseClient, getContentStoreDriver } from '../config/supabase.js';
import { logger } from '../logger/logger.js';
import type { CinemojiPuzzle, CinemojiMode } from '../types/cinemoji.types.js';

const PUZZLES_TABLE = 'cinemoji_puzzles';
const HINTS_TABLE = 'cinemoji_stage_hints';

type PuzzleRow = {
  puzzle_index: number;
  category: string;
  left_emoji: string;
  right_emoji: string;
  title: string;
};

type HintRow = {
  mode: string;
  stage: number;
  hint_text: string;
};

function useSupabase(): boolean {
  const driver = getContentStoreDriver();
  return driver === 'supabase' || driver === 'dual';
}

/**
 * Upsert a Cinemoji puzzle (creates or updates).
 */
export async function upsertCinemojiPuzzle(puzzle: CinemojiPuzzle): Promise<CinemojiPuzzle> {
  if (!useSupabase()) {
    throw new Error('Cinemoji admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const row: PuzzleRow = {
    puzzle_index: puzzle.index,
    category: puzzle.category,
    left_emoji: puzzle.leftEmoji,
    right_emoji: puzzle.rightEmoji,
    title: puzzle.title,
  };

  const res = await client
    .from(PUZZLES_TABLE)
    .upsert(row, { onConflict: 'puzzle_index' })
    .select()
    .single();

  if (res.error) {
    logger.error('upsert_cinemoji_puzzle failed', { err: res.error, puzzle });
    throw res.error;
  }

  logger.info('cinemoji_puzzle upserted', { index: puzzle.index });
  return puzzle;
}

/**
 * Delete a Cinemoji puzzle by index.
 */
export async function deleteCinemojiPuzzle(index: number): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Cinemoji admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const res = await client.from(PUZZLES_TABLE).delete().eq('puzzle_index', index);

  if (res.error) {
    logger.error('delete_cinemoji_puzzle failed', { err: res.error, index });
    throw res.error;
  }

  logger.info('cinemoji_puzzle deleted', { index });
}

/**
 * Upsert a stage hint (creates or updates).
 */
export async function upsertCinemojiHint(
  mode: CinemojiMode,
  stage: number,
  hintText: string
): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Cinemoji admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const row: HintRow = {
    mode,
    stage,
    hint_text: hintText,
  };

  const res = await client
    .from(HINTS_TABLE)
    .upsert(row, { onConflict: 'mode,stage' })
    .select()
    .single();

  if (res.error) {
    logger.error('upsert_cinemoji_hint failed', { err: res.error, mode, stage });
    throw res.error;
  }

  logger.info('cinemoji_hint upserted', { mode, stage });
}

/**
 * Delete a stage hint.
 */
export async function deleteCinemojiHint(mode: CinemojiMode, stage: number): Promise<void> {
  if (!useSupabase()) {
    throw new Error('Cinemoji admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const res = await client.from(HINTS_TABLE).delete().match({ mode, stage });

  if (res.error) {
    logger.error('delete_cinemoji_hint failed', { err: res.error, mode, stage });
    throw res.error;
  }

  logger.info('cinemoji_hint deleted', { mode, stage });
}

/**
 * Batch upsert multiple puzzles.
 */
export async function batchUpsertCinemojiPuzzles(
  puzzles: CinemojiPuzzle[]
): Promise<CinemojiPuzzle[]> {
  if (!useSupabase()) {
    throw new Error('Cinemoji admin requires Supabase');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }

  const rows: PuzzleRow[] = puzzles.map((p) => ({
    puzzle_index: p.index,
    category: p.category,
    left_emoji: p.leftEmoji,
    right_emoji: p.rightEmoji,
    title: p.title,
  }));

  const res = await client.from(PUZZLES_TABLE).upsert(rows, { onConflict: 'puzzle_index' });

  if (res.error) {
    logger.error('batch_upsert_cinemoji_puzzles failed', { err: res.error, count: puzzles.length });
    throw res.error;
  }

  logger.info('cinemoji_puzzles batch upserted', { count: puzzles.length });
  return puzzles;
}
