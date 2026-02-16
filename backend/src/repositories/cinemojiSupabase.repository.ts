import { getSupabaseClient } from '../config/supabase.js';
import { logger } from '../logger/logger.js';
import type { CinemojiPuzzle } from '../types/cinemoji.types.js';

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

function toPuzzle(row: PuzzleRow): CinemojiPuzzle {
  return {
    index: row.puzzle_index,
    category: row.category,
    leftEmoji: row.left_emoji,
    rightEmoji: row.right_emoji,
    title: row.title,
  };
}

export async function supabaseGetCinemojiPuzzles(): Promise<CinemojiPuzzle[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const res = await client.from(PUZZLES_TABLE).select('*').order('puzzle_index', { ascending: true });
  if (res.error) {
    logger.error('supabase_get_cinemoji_puzzles failed', { err: res.error });
    throw res.error;
  }

  const rows = (res.data ?? []) as PuzzleRow[];
  return rows.map((r) => toPuzzle(r));
}

export async function supabaseGetCinemojiHints(): Promise<{
  mode1: Map<number, string>;
  mode2: Map<number, string>;
}> {
  const client = getSupabaseClient();
  const hints = { mode1: new Map<number, string>(), mode2: new Map<number, string>() };
  if (!client) return hints;

  const res = await client.from(HINTS_TABLE).select('*');
  if (res.error) {
    logger.error('supabase_get_cinemoji_hints failed', { err: res.error });
    throw res.error;
  }

  const rows = (res.data ?? []) as HintRow[];
  for (const row of rows) {
    if (row.mode === 'mode1') {
      hints.mode1.set(row.stage, row.hint_text);
    } else if (row.mode === 'mode2') {
      hints.mode2.set(row.stage, row.hint_text);
    }
  }
  return hints;
}
