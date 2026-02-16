import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger/logger.js';
import type {
  CinemojiConfig,
  CinemojiMode,
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
const THE_GAME_FILENAME = 'TheGame.txt';
const STAGES_FILENAME = 'stages.txt';

type StageHints = {
  mode1: Map<number, string>;
  mode2: Map<number, string>;
};

type ParsedRound = Omit<CinemojiPuzzle, 'index'>;

let cachedConfig: CinemojiConfig | null = null;

function getCinemojiDirectory(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  return path.resolve(currentDir, '../../../Cinemoji');
}

function normalizeGuess(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[’'`]/g, '')
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
    if (!current || !target) {
      continue;
    }
    arr[i] = target;
    arr[j] = current;
  }
  return arr;
}

function fallbackRounds(): ParsedRound[] {
  const base: ParsedRound[] = [
    { category: 'Movies', leftEmoji: '🦁', rightEmoji: '👑', title: 'The Lion King' },
    { category: 'Movies', leftEmoji: '🚢', rightEmoji: '🧊', title: 'Titanic' },
    { category: 'Movies', leftEmoji: '🧙‍♂️', rightEmoji: '💍', title: 'The Lord of the Rings' },
    { category: 'TV SHOWS', leftEmoji: '🐉', rightEmoji: '🔥', title: 'Game of Thrones' },
    { category: 'TV SHOWS', leftEmoji: '🧪', rightEmoji: '🟦', title: 'Breaking Bad' },
  ];
  const rounds: ParsedRound[] = [];
  for (let i = 0; i < 40; i += 1) {
    const row = base[i % base.length];
    if (row) {
      rounds.push({ ...row });
    }
  }
  return rounds;
}

function parseTheGame(content: string): ParsedRound[] {
  const rounds: ParsedRound[] = [];
  let category = 'Movies';

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const upper = line.toUpperCase();
    if (upper === 'MOVIES' || upper === 'TV SHOWS') {
      category = upper;
      continue;
    }

    const match = line.match(/^(.+?)\s*→\s*(.+?)\s*\((.+)\)$/);
    if (!match) {
      logger.warn('cinemoji malformed THEGAME row skipped', { line });
      continue;
    }

    const leftEmoji = match[1]?.trim();
    const rightEmoji = match[2]?.trim();
    const title = match[3]?.trim();
    if (!leftEmoji || !rightEmoji || !title) {
      logger.warn('cinemoji invalid parsed THEGAME row skipped', { line });
      continue;
    }

    rounds.push({ category, leftEmoji, rightEmoji, title });
  }

  if (rounds.length < 1) {
    logger.warn('cinemoji THEGAME parse produced no rounds, using fallback');
    return fallbackRounds();
  }

  if (rounds.length < 40) {
    logger.warn('cinemoji THEGAME has less than 40 rounds, padding deterministically', {
      parsedRounds: rounds.length,
    });
    const padded = [...rounds];
    let i = 0;
    while (padded.length < 40) {
      const row = rounds[i % rounds.length];
      if (!row) {
        break;
      }
      padded.push({ ...row });
      i += 1;
    }
    return padded;
  }

  return rounds.slice(0, 40);
}

function parseStageHints(content: string): StageHints {
  const hints: StageHints = { mode1: new Map(), mode2: new Map() };
  let section: CinemojiMode | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const normalized = line.toLowerCase();
    if (normalized === '[mode1]') {
      section = 'mode1';
      continue;
    }
    if (normalized === '[mode2]') {
      section = 'mode2';
      continue;
    }
    if (!section) {
      continue;
    }

    const splitIndex = line.indexOf('|');
    if (splitIndex < 1) {
      logger.warn('cinemoji malformed stage hint line skipped', { line, section });
      continue;
    }

    const stageRaw = line.slice(0, splitIndex).trim();
    const hint = line.slice(splitIndex + 1).trim();
    const stageNumber = Number(stageRaw);

    if (!Number.isInteger(stageNumber) || stageNumber < 1 || !hint) {
      logger.warn('cinemoji invalid stage hint line skipped', { line, section });
      continue;
    }

    hints[section].set(stageNumber, hint);
  }

  return hints;
}

function buildMode1Stages(rounds: CinemojiPuzzle[], hints: StageHints): CinemojiMode1Stage[] {
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
  if (!target) {
    throw new Error(`missing target round at index ${roundIndex}`);
  }

  const selected = [target];
  for (let i = 1; i < MODE2_CHOICES_PER_SIDE; i += 1) {
    const candidate = rounds[(roundIndex + i) % rounds.length];
    if (candidate) {
      selected.push(candidate);
    }
  }

  const leftChoices = deterministicShuffle(
    selected.map((entry) => entry.leftEmoji),
    roundIndex + 17,
  );
  const rightChoices = deterministicShuffle(
    selected.map((entry) => entry.rightEmoji),
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

function buildMode2Stages(rounds: CinemojiPuzzle[], hints: StageHints): CinemojiMode2Stage[] {
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

async function readCinemojiFiles(): Promise<{ gameFile: string; stagesFile: string }> {
  const cinemojiDir = getCinemojiDirectory();
  const gamePath = path.resolve(cinemojiDir, THE_GAME_FILENAME);
  const stagesPath = path.resolve(cinemojiDir, STAGES_FILENAME);

  const [gameFile, stagesFile] = await Promise.all([
    readFile(gamePath, 'utf-8'),
    readFile(stagesPath, 'utf-8'),
  ]);

  return { gameFile, stagesFile };
}

async function buildConfig(): Promise<CinemojiConfig> {
  try {
    const { gameFile, stagesFile } = await readCinemojiFiles();
    const parsedRounds = parseTheGame(gameFile);
    const rounds: CinemojiPuzzle[] = parsedRounds.map((item, idx) => ({
      index: idx + 1,
      category: item.category,
      leftEmoji: item.leftEmoji,
      rightEmoji: item.rightEmoji,
      title: item.title,
    }));

    const hints = parseStageHints(stagesFile);

    return {
      mode1Stages: buildMode1Stages(rounds, hints),
      mode2Stages: buildMode2Stages(rounds, hints),
    };
  } catch (error) {
    logger.error('cinemoji file loading failed, using fallback content', { err: error });
    const rounds = fallbackRounds().map((item, idx) => ({
      index: idx + 1,
      category: item.category,
      leftEmoji: item.leftEmoji,
      rightEmoji: item.rightEmoji,
      title: item.title,
    }));
    const hints: StageHints = { mode1: new Map(), mode2: new Map() };
    return {
      mode1Stages: buildMode1Stages(rounds, hints),
      mode2Stages: buildMode2Stages(rounds, hints),
    };
  }
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
