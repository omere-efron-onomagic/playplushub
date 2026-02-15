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
