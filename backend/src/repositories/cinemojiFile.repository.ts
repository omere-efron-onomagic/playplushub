import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger/logger.js';
import type { CinemojiMode, CinemojiPuzzle } from '../types/cinemoji.types.js';

const THE_GAME_FILENAME = 'TheGame.txt';
const STAGES_FILENAME = 'stages.txt';

export type StageHints = {
  mode1: Map<number, string>;
  mode2: Map<number, string>;
};

type ParsedRound = Omit<CinemojiPuzzle, 'index'>;

function getCinemojiDirectory(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  return path.resolve(currentDir, '../../../Cinemoji');
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
    if (row) rounds.push({ ...row });
  }
  return rounds;
}

function parseTheGame(content: string): ParsedRound[] {
  const rounds: ParsedRound[] = [];
  let category = 'Movies';

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

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
      if (!row) break;
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
    if (!line) continue;

    const normalized = line.toLowerCase();
    if (normalized === '[mode1]') {
      section = 'mode1';
      continue;
    }
    if (normalized === '[mode2]') {
      section = 'mode2';
      continue;
    }
    if (!section) continue;

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

export async function fileGetCinemojiPuzzles(): Promise<CinemojiPuzzle[]> {
  try {
    const cinemojiDir = getCinemojiDirectory();
    const gamePath = path.resolve(cinemojiDir, THE_GAME_FILENAME);
    const content = await readFile(gamePath, 'utf-8');
    const parsed = parseTheGame(content);
    return parsed.map((item, idx) => ({
      index: idx + 1,
      category: item.category,
      leftEmoji: item.leftEmoji,
      rightEmoji: item.rightEmoji,
      title: item.title,
    }));
  } catch (error) {
    logger.error('cinemoji file loading failed, using fallback puzzles', { err: error });
    return fallbackRounds().map((item, idx) => ({
      index: idx + 1,
      category: item.category,
      leftEmoji: item.leftEmoji,
      rightEmoji: item.rightEmoji,
      title: item.title,
    }));
  }
}

export async function fileGetCinemojiHints(): Promise<StageHints> {
  try {
    const cinemojiDir = getCinemojiDirectory();
    const stagesPath = path.resolve(cinemojiDir, STAGES_FILENAME);
    const content = await readFile(stagesPath, 'utf-8');
    return parseStageHints(content);
  } catch (error) {
    logger.error('cinemoji stages file loading failed, using empty hints', { err: error });
    return { mode1: new Map(), mode2: new Map() };
  }
}
