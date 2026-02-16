import {
  getContentStoreDriver,
  isSupabaseConfigured,
} from '../config/supabase.js';
import {
  fileGetCinemojiPuzzles,
  fileGetCinemojiHints,
} from '../repositories/cinemojiFile.repository.js';
import {
  supabaseGetCinemojiPuzzles,
  supabaseGetCinemojiHints,
} from '../repositories/cinemojiSupabase.repository.js';
import { logger } from '../logger/logger.js';
import type {
  CinemojiConfig,
  CinemojiMode1Stage,
  CinemojiMode2Round,
  CinemojiMode2Stage,
  CinemojiPuzzle,
} from '../types/cinemoji.types.js';

const MODE1_STAGE_COUNT = 4;
const MODE1_PUZZLES_PER_STAGE = 10;
const MODE2_STAGE_COUNT = 8;
const MODE2_ROUNDS_PER_STAGE = 5;
const MODE2_CHOICES_PER_SIDE = 5;

let cachedConfig: CinemojiConfig | null = null;

function normalizeGuess(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[''`]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .trim();
}

function deterministicShuffle(values: string[], seed: number): string[] {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = (seed + i * 13) % (i + 1);
    const current = arr[i];
    const target = arr[j];
    if (!current || !target) continue;
    arr[i] = target;
    arr[j] = current;
  }
  return arr;
}

function buildMode1Stages(
  rounds: CinemojiPuzzle[],
  hints: { mode1: Map<number, string>; mode2: Map<number, string> },
): CinemojiMode1Stage[] {
  const stages: CinemojiMode1Stage[] = [];
  for (let stage = 1; stage <= MODE1_STAGE_COUNT; stage += 1) {
    const start = (stage - 1) * MODE1_PUZZLES_PER_STAGE;
    const end = start + MODE1_PUZZLES_PER_STAGE;
    stages.push({
      stage,
      hint: hints.mode1.get(stage) ?? `Stage ${stage} hint is unavailable.`,
      puzzles: rounds.slice(start, end),
    });
  }
  return stages;
}

function buildMode2RoundChoices(rounds: CinemojiPuzzle[], roundIndex: number): CinemojiMode2Round {
  const target = rounds[roundIndex];
  if (!target) throw new Error(`missing target round at index ${roundIndex}`);

  const selected = [target];
  for (let i = 1; i < MODE2_CHOICES_PER_SIDE; i += 1) {
    const candidate = rounds[(roundIndex + i) % rounds.length];
    if (candidate) selected.push(candidate);
  }

  const leftChoices = deterministicShuffle(
    selected.map((e) => e.leftEmoji),
    roundIndex + 17,
  );
  const rightChoices = deterministicShuffle(
    selected.map((e) => e.rightEmoji),
    roundIndex + 41,
  );

  return {
    roundIndex: roundIndex + 1,
    title: target.title,
    leftEmoji: target.leftEmoji,
    rightEmoji: target.rightEmoji,
    leftChoices,
    rightChoices,
  };
}

function buildMode2Stages(
  rounds: CinemojiPuzzle[],
  hints: { mode1: Map<number, string>; mode2: Map<number, string> },
): CinemojiMode2Stage[] {
  const stages: CinemojiMode2Stage[] = [];
  for (let stage = 1; stage <= MODE2_STAGE_COUNT; stage += 1) {
    const stageStart = (stage - 1) * MODE2_ROUNDS_PER_STAGE;
    const stageRounds: CinemojiMode2Round[] = [];
    for (let i = 0; i < MODE2_ROUNDS_PER_STAGE; i += 1) {
      stageRounds.push(buildMode2RoundChoices(rounds, stageStart + i));
    }
    stages.push({
      stage,
      hint: hints.mode2.get(stage) ?? `Stage ${stage} hint is unavailable.`,
      rounds: stageRounds,
    });
  }
  return stages;
}

async function loadPuzzlesAndHints(): Promise<{
  puzzles: CinemojiPuzzle[];
  hints: { mode1: Map<number, string>; mode2: Map<number, string> };
}> {
  const driver = getContentStoreDriver();
  const useSupabase =
    (driver === 'supabase' || driver === 'dual') && isSupabaseConfigured();

  if (useSupabase && driver === 'supabase') {
    const [puzzles, hints] = await Promise.all([
      supabaseGetCinemojiPuzzles(),
      supabaseGetCinemojiHints(),
    ]);
    if (puzzles.length >= 40) {
      return { puzzles, hints };
    }
    logger.warn('cinemoji supabase returned insufficient puzzles, falling back to files', {
      count: puzzles.length,
    });
  }

  if (useSupabase && driver === 'dual') {
    try {
      const [puzzles, hints] = await Promise.all([
        supabaseGetCinemojiPuzzles(),
        supabaseGetCinemojiHints(),
      ]);
      if (puzzles.length >= 40) {
        return { puzzles, hints };
      }
    } catch (err) {
      logger.warn('cinemoji supabase read failed, falling back to files', { err });
    }
  }

  const [puzzles, hints] = await Promise.all([
    fileGetCinemojiPuzzles(),
    fileGetCinemojiHints(),
  ]);
  return { puzzles, hints };
}

async function buildConfig(): Promise<CinemojiConfig> {
  const { puzzles, hints } = await loadPuzzlesAndHints();
  return {
    mode1Stages: buildMode1Stages(puzzles, hints),
    mode2Stages: buildMode2Stages(puzzles, hints),
  };
}

export async function getCinemojiConfig(): Promise<CinemojiConfig> {
  if (!cachedConfig) {
    cachedConfig = await buildConfig();
  }
  return cachedConfig;
}

export async function reloadCinemojiConfig(): Promise<CinemojiConfig> {
  cachedConfig = await buildConfig();
  return cachedConfig;
}

export function normalizeCinemojiGuess(guess: string): string {
  return normalizeGuess(guess);
}
