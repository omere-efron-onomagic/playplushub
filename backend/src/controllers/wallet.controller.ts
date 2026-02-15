import type { Request, Response } from 'express';
import { addCoinsToUser, deductCoinsFromUser, findUserById } from '../services/userStore.service.js';
import {
  getGameCatalogEntry,
  createGameSessionToken,
  verifyGameSessionToken,
  tryClaim,
  appendTransaction,
  computeRewardFromOutcome,
} from '../services/economy/index.js';
import { logger } from '../logger/logger.js';

/** Deprecated: use POST /wallet/session/start and POST /wallet/session/claim instead. */
export async function rewardCoins(req: Request, res: Response) {
  try {
    logger.warn('POST /wallet/reward called (deprecated)', {
      requestId: req.requestId,
      userId: req.authUserId,
    });
    return res.status(410).json({
      message: 'deprecated: use POST /wallet/session/start before play, then POST /wallet/session/claim after completion',
      code: 'DEPRECATED_REWARD_ENDPOINT',
    });
  } catch (error) {
    logger.error('rewardCoins failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function startSession(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    if (!authUserId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const { gameId } = req.body as { gameId: string };

    const entry = getGameCatalogEntry(gameId);
    if (!entry) {
      logger.warn('session start: unknown gameId', { gameId, requestId: req.requestId });
      return res.status(400).json({ message: 'invalid gameId' });
    }

    const user = await findUserById(authUserId);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    if (user.coins < entry.coinCost) {
      logger.info('session start: insufficient funds', {
        userId: authUserId,
        gameId,
        coinCost: entry.coinCost,
        balance: user.coins,
        requestId: req.requestId,
      });
      return res.status(422).json({
        message: 'insufficient funds',
        code: 'INSUFFICIENT_FUNDS',
        coinCost: entry.coinCost,
        coins: user.coins,
      });
    }

    const updated = await deductCoinsFromUser(authUserId, entry.coinCost);
    if (!updated) {
      return res.status(404).json({ message: 'user not found' });
    }

    const { sessionId, token } = createGameSessionToken(authUserId, gameId);

    await appendTransaction({
      userId: authUserId,
      kind: 'spend',
      amount: entry.coinCost,
      balanceBefore: user.coins,
      balanceAfter: updated.coins,
      reason: 'game_entry',
      gameId,
      sessionId,
    });

    logger.info('session start success', {
      userId: authUserId,
      gameId,
      sessionId,
      requestId: req.requestId,
    });

    return res.status(200).json({
      sessionId,
      sessionToken: token,
      coins: updated.coins,
      coinCost: entry.coinCost,
    });
  } catch (error) {
    const err = error as Error;
    if (err.message === 'insufficient_funds') {
      return res.status(422).json({
        message: 'insufficient funds',
        code: 'INSUFFICIENT_FUNDS',
      });
    }
    logger.error('startSession failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

export async function claimSession(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    if (!authUserId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const { sessionToken, outcome } = req.body as {
      sessionToken: string;
      outcome: { levelsCompleted: number; totalLevels: number; won: boolean };
    };

    const payload = verifyGameSessionToken(sessionToken);
    if (!payload) {
      logger.warn('claim: invalid or expired session token', { requestId: req.requestId });
      return res.status(401).json({ message: 'invalid or expired session token' });
    }

    if (payload.userId !== authUserId) {
      logger.warn('claim: session user mismatch', {
        sessionUserId: payload.userId,
        authUserId,
        requestId: req.requestId,
      });
      return res.status(403).json({ message: 'session does not belong to this user' });
    }

    const claimed = await tryClaim(payload.sessionId);
    if (!claimed) {
      logger.warn('claim: duplicate claim attempted', {
        sessionId: payload.sessionId,
        userId: authUserId,
        requestId: req.requestId,
      });
      return res.status(409).json({ message: 'reward already claimed for this session', code: 'DUPLICATE_CLAIM' });
    }

    const { earnedCoins, valid } = computeRewardFromOutcome(payload.gameId, outcome);
    if (!valid) {
      logger.warn('claim: invalid outcome', {
        sessionId: payload.sessionId,
        outcome,
        requestId: req.requestId,
      });
      return res.status(422).json({ message: 'invalid gameplay outcome', code: 'INVALID_OUTCOME' });
    }

    if (earnedCoins === 0) {
      const user = await findUserById(authUserId);
      return res.status(200).json({
        earnedCoins: 0,
        coins: user?.coins ?? 0,
      });
    }

    const user = await findUserById(authUserId);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    const before = user.coins;
    const updated = await addCoinsToUser(authUserId, earnedCoins);
    if (!updated) {
      return res.status(404).json({ message: 'user not found' });
    }

    await appendTransaction({
      userId: authUserId,
      kind: 'reward',
      amount: earnedCoins,
      balanceBefore: before,
      balanceAfter: updated.coins,
      reason: 'game_win',
      gameId: payload.gameId,
      sessionId: payload.sessionId,
    });

    logger.info('claim success', {
      userId: authUserId,
      sessionId: payload.sessionId,
      earnedCoins,
      requestId: req.requestId,
    });

    return res.status(200).json({
      earnedCoins,
      coins: updated.coins,
    });
  } catch (error) {
    logger.error('claimSession failed', { err: error, requestId: req.requestId });
    return res.status(500).json({ message: 'server error' });
  }
}
