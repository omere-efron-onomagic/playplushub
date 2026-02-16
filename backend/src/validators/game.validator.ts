import type { Request, Response, NextFunction } from 'express';
import type { GameCategory } from '../types/game.types.js';

const CATEGORIES: GameCategory[] = [
  'Puzzle',
  'Simulation',
  'Adventure',
  'Racing',
  'Trivia',
  'Action',
];

function isGameCategory(v: unknown): v is GameCategory {
  return typeof v === 'string' && CATEGORIES.includes(v as GameCategory);
}

export function validateCreateGameBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  const b = req.body as Record<string, unknown>;
  if (typeof b.gameId !== 'string' || !b.gameId.trim()) {
    return res.status(400).json({ message: 'gameId is required' });
  }
  if (typeof b.slug !== 'string' || !b.slug.trim()) {
    return res.status(400).json({ message: 'slug is required' });
  }
  if (typeof b.title !== 'string' || !b.title.trim()) {
    return res.status(400).json({ message: 'title is required' });
  }
  if (!isGameCategory(b.category)) {
    return res.status(400).json({ message: 'category must be a valid GameCategory' });
  }
  if (typeof b.coverImageUrl !== 'string' || !b.coverImageUrl.trim()) {
    return res.status(400).json({ message: 'coverImageUrl is required' });
  }
  if (!Number.isInteger(b.coinCost) || (b.coinCost as number) < 0) {
    return res.status(400).json({ message: 'coinCost must be a non-negative integer' });
  }
  if (!Number.isInteger(b.rewardCoins) || (b.rewardCoins as number) < 0) {
    return res.status(400).json({ message: 'rewardCoins must be a non-negative integer' });
  }
  if (b.totalLevels !== undefined && (!Number.isInteger(b.totalLevels) || (b.totalLevels as number) < 1)) {
    return res.status(400).json({ message: 'totalLevels must be a positive integer if present' });
  }
  return next();
}

export function validatePatchGameBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  const b = req.body as Record<string, unknown>;
  if (b.category !== undefined && !isGameCategory(b.category)) {
    return res.status(400).json({ message: 'category must be a valid GameCategory if present' });
  }
  if (b.coinCost !== undefined && (!Number.isInteger(b.coinCost) || (b.coinCost as number) < 0)) {
    return res.status(400).json({ message: 'coinCost must be a non-negative integer if present' });
  }
  if (b.rewardCoins !== undefined && (!Number.isInteger(b.rewardCoins) || (b.rewardCoins as number) < 0)) {
    return res.status(400).json({ message: 'rewardCoins must be a non-negative integer if present' });
  }
  if (b.totalLevels !== undefined && (!Number.isInteger(b.totalLevels) || (b.totalLevels as number) < 1)) {
    return res.status(400).json({ message: 'totalLevels must be a positive integer if present' });
  }
  return next();
}

function isValidImages(arr: unknown): arr is [string, string, string, string] {
  return (
    Array.isArray(arr) &&
    arr.length === 4 &&
    arr.every((x) => typeof x === 'string' && x.length > 0)
  );
}

export function validateUpsertLevelsBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  const b = req.body as { levels?: unknown };
  if (!Array.isArray(b.levels)) {
    return res.status(400).json({ message: 'levels must be an array' });
  }
  for (let i = 0; i < b.levels.length; i++) {
    const l = b.levels[i] as Record<string, unknown>;
    if (typeof l.roundId !== 'string' || !l.roundId.trim()) {
      return res.status(400).json({ message: `levels[${i}].roundId is required` });
    }
    if (!Number.isInteger(l.level) || (l.level as number) < 1) {
      return res.status(400).json({ message: `levels[${i}].level must be a positive integer` });
    }
    if (typeof l.answer !== 'string' || !l.answer.trim()) {
      return res.status(400).json({ message: `levels[${i}].answer is required` });
    }
    if (!isValidImages(l.images)) {
      return res.status(400).json({ message: `levels[${i}].images must be array of 4 strings` });
    }
    if (typeof l.extraLetters !== 'string') {
      return res.status(400).json({ message: `levels[${i}].extraLetters must be a string` });
    }
  }
  return next();
}

export function validateCreateRoundBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'body is required' });
  }
  const b = req.body as { roundId?: unknown; levels?: unknown };
  if (typeof b.roundId !== 'string' || !b.roundId.trim()) {
    return res.status(400).json({ message: 'roundId is required' });
  }
  if (!Array.isArray(b.levels) || b.levels.length === 0) {
    return res.status(400).json({ message: 'levels must be a non-empty array' });
  }
  for (let i = 0; i < b.levels.length; i++) {
    const l = b.levels[i] as Record<string, unknown>;
    if (typeof l.answer !== 'string' || !l.answer.trim()) {
      return res.status(400).json({ message: `levels[${i}].answer is required` });
    }
    if (!isValidImages(l.images)) {
      return res.status(400).json({ message: `levels[${i}].images must be array of 4 strings` });
    }
  }
  return next();
}
