import type { NextFunction, Request, Response } from 'express';

export function validateRewardBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { gameId, rewardCoins } = req.body as { gameId?: unknown; rewardCoins?: unknown };

  if (typeof gameId !== 'string' || !gameId.trim()) {
    return res.status(400).json({ message: 'gameId is required' });
  }

  if (!Number.isInteger(rewardCoins) || (rewardCoins as number) <= 0) {
    return res.status(400).json({ message: 'rewardCoins must be a positive integer' });
  }

  return next();
}

export function validateSessionStartBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { gameId } = req.body as { gameId?: unknown };

  if (typeof gameId !== 'string' || !gameId.trim()) {
    return res.status(400).json({ message: 'gameId is required' });
  }

  return next();
}

export function validateSessionClaimBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body) {
    return res.status(400).json({ message: 'body is required' });
  }

  const { sessionToken, outcome } = req.body as {
    sessionToken?: unknown;
    outcome?: unknown;
  };

  if (typeof sessionToken !== 'string' || !sessionToken.trim()) {
    return res.status(400).json({ message: 'sessionToken is required' });
  }

  if (!outcome || typeof outcome !== 'object') {
    return res.status(400).json({ message: 'outcome is required and must be an object' });
  }

  const o = outcome as Record<string, unknown>;
  const levelsCompleted = o.levelsCompleted;
  const totalLevels = o.totalLevels;
  const won = o.won;

  if (!Number.isInteger(levelsCompleted) || (levelsCompleted as number) < 0) {
    return res.status(400).json({ message: 'outcome.levelsCompleted must be a non-negative integer' });
  }

  if (!Number.isInteger(totalLevels) || (totalLevels as number) < 1) {
    return res.status(400).json({ message: 'outcome.totalLevels must be a positive integer' });
  }

  if (typeof won !== 'boolean') {
    return res.status(400).json({ message: 'outcome.won must be a boolean' });
  }

  return next();
}
