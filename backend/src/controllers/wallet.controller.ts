import type { Request, Response } from 'express';
import { addCoinsToUser } from '../services/userStore.service.js';
import { logger } from '../logger/logger.js';

type RewardBody = {
  gameId: string;
  rewardCoins: number;
};

export async function rewardCoins(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    if (!authUserId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const { gameId, rewardCoins } = req.body as RewardBody;
    if (typeof gameId !== 'string' || !gameId.trim()) {
      return res.status(400).json({ message: 'gameId is required' });
    }

    if (!Number.isInteger(rewardCoins) || rewardCoins <= 0) {
      return res.status(400).json({ message: 'rewardCoins must be a positive integer' });
    }

    const user = await addCoinsToUser(authUserId, rewardCoins);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    return res.status(200).json({
      gameId,
      earnedCoins: rewardCoins,
      coins: user.coins,
    });
  } catch (error) {
    logger.error('rewardCoins failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}
