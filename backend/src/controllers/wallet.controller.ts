import type { Request, Response } from 'express';
import { addCoinsToUser, deductCoinsFromUser, findUserById } from '../services/userStore.service.js';
import {
  deductCoinsFromGuest,
  findGuestById,
  addCoinsToGuest,
} from '../services/guestStore.service.js';
import {
  getGameCatalogEntry,
  createGameSessionToken,
  verifyGameSessionToken,
  tryClaim,
  appendTransaction,
  computeRewardFromOutcome,
} from '../services/economy/index.js';
import { getGameById } from '../services/gameStore.service.js';
import {
  hasCompletedRound,
  markRoundComplete,
} from '../services/progressionStore.service.js';
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
    const guestId = req.guestId;
    const actorId = authUserId ?? guestId;
    const isGuest = !!guestId;

    if (!actorId) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const { gameId, roundId } = req.body as { gameId: string; roundId?: string };

    const gameEntry = await getGameById(gameId);
    const entry = await getGameCatalogEntry(gameId);
    if (!entry) {
      logger.warn('session start: unknown gameId', { gameId, requestId: req.requestId });
      return res.status(400).json({ message: 'invalid gameId' });
    }
    if (gameEntry?.totalRounds && (!roundId || !roundId.trim())) {
      return res.status(400).json({ message: 'roundId is required for this game' });
    }
    if (roundId) {
      const alreadyCompleted = await hasCompletedRound(
        actorId,
        isGuest ? 'guest' : 'user',
        gameId,
        roundId,
      );
      if (alreadyCompleted) {
        logger.info('session start: round already completed', {
          actorId,
          gameId,
          roundId,
          requestId: req.requestId,
        });
        return res.status(422).json({
          message: 'round already completed',
          code: 'ROUND_ALREADY_COMPLETED',
        });
      }
    }

    if (isGuest) {
      const guest = await findGuestById(guestId);
      if (!guest || guest.migratedTo) {
        return res.status(404).json({ message: 'guest not found' });
      }
      if (guest.coins < entry.coinCost) {
        logger.info('session start: insufficient funds (guest)', {
          guestId,
          gameId,
          coinCost: entry.coinCost,
          balance: guest.coins,
          requestId: req.requestId,
        });
        return res.status(422).json({
          message: 'insufficient funds',
          code: 'INSUFFICIENT_FUNDS',
          coinCost: entry.coinCost,
          coins: guest.coins,
        });
      }
      const updated = await deductCoinsFromGuest(guestId, entry.coinCost);
      if (!updated) {
        return res.status(404).json({ message: 'guest not found' });
      }
      const { sessionId, token } = createGameSessionToken(guestId, gameId, true, roundId);
      await appendTransaction({
        userId: guestId,
        kind: 'spend',
        amount: entry.coinCost,
        balanceBefore: guest.coins,
        balanceAfter: updated.coins,
        reason: 'game_entry',
        gameId,
        sessionId,
        guestId,
      });
      logger.info('session start success (guest)', {
        guestId,
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
    }

    const uid = authUserId!;
    const user = await findUserById(uid);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    if (user.coins < entry.coinCost) {
      logger.info('session start: insufficient funds', {
        userId: uid,
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
    const updated = await deductCoinsFromUser(uid, entry.coinCost);
    if (!updated) {
      return res.status(404).json({ message: 'user not found' });
    }
    const { sessionId, token } = createGameSessionToken(uid, gameId, false, roundId);
    await appendTransaction({
      userId: uid,
      kind: 'spend',
      amount: entry.coinCost,
      balanceBefore: user.coins,
      balanceAfter: updated.coins,
      reason: 'game_entry',
      gameId,
      sessionId,
    });
    logger.info('session start success', {
      userId: uid,
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
    const guestId = req.guestId;
    const actorId = authUserId ?? guestId;
    const isGuest = !!guestId;

    if (!actorId) {
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

    if (payload.isGuest) {
      if (!guestId || payload.userId !== guestId) {
        logger.warn('claim: guest session token mismatch', {
          sessionGuestId: payload.userId,
          guestId,
          requestId: req.requestId,
        });
        return res.status(403).json({ message: 'session does not belong to this guest' });
      }
    } else {
      if (!authUserId || payload.userId !== authUserId) {
        logger.warn('claim: session user mismatch', {
          sessionUserId: payload.userId,
          authUserId,
          requestId: req.requestId,
        });
        return res.status(403).json({ message: 'session does not belong to this user' });
      }
    }

    const claimed = await tryClaim(payload.sessionId);
    if (!claimed) {
      logger.warn('claim: duplicate claim attempted', {
        sessionId: payload.sessionId,
        actorId,
        isGuest,
        requestId: req.requestId,
      });
      return res.status(409).json({ message: 'reward already claimed for this session', code: 'DUPLICATE_CLAIM' });
    }

    const { earnedCoins, valid } = await computeRewardFromOutcome(
      payload.gameId,
      outcome,
      payload.roundId,
    );
    if (!valid) {
      logger.warn('claim: invalid outcome', {
        sessionId: payload.sessionId,
        outcome,
        requestId: req.requestId,
      });
      return res.status(422).json({ message: 'invalid gameplay outcome', code: 'INVALID_OUTCOME' });
    }

    if (payload.roundId && earnedCoins > 0) {
      await markRoundComplete(
        actorId,
        isGuest ? 'guest' : 'user',
        payload.gameId,
        payload.roundId,
      );
    }

    if (earnedCoins === 0) {
      if (isGuest) {
        const gid = guestId!;
        const guest = await findGuestById(gid);
        return res.status(200).json({
          earnedCoins: 0,
          coins: guest?.coins ?? 0,
          signupPromptCount: guest?.signupPromptCount,
          signupRequired: guest?.signupRequired,
        });
      }
      const uid = authUserId!;
      const user = await findUserById(uid);
      return res.status(200).json({
        earnedCoins: 0,
        coins: user?.coins ?? 0,
      });
    }

    if (isGuest) {
      const gid = guestId!;
      const guest = await findGuestById(gid);
      if (!guest || guest.migratedTo) {
        return res.status(404).json({ message: 'guest not found' });
      }
      const before = guest.coins;
      const updated = await addCoinsToGuest(gid, earnedCoins);
      if (!updated) {
        return res.status(404).json({ message: 'guest not found' });
      }
      await appendTransaction({
        userId: gid,
        kind: 'reward',
        amount: earnedCoins,
        balanceBefore: before,
        balanceAfter: updated.coins,
        reason: 'game_win',
        gameId: payload.gameId,
        sessionId: payload.sessionId,
        guestId: gid,
      });
      logger.info('claim success (guest)', {
        guestId: gid,
        sessionId: payload.sessionId,
        earnedCoins,
        requestId: req.requestId,
      });
      return res.status(200).json({
        earnedCoins,
        coins: updated.coins,
        signupPromptCount: updated.signupPromptCount,
        signupRequired: updated.signupRequired,
      });
    }

    const uid = authUserId!;
    const user = await findUserById(uid);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    const before = user.coins;
    const updated = await addCoinsToUser(uid, earnedCoins);
    if (!updated) {
      return res.status(404).json({ message: 'user not found' });
    }
    await appendTransaction({
      userId: uid,
      kind: 'reward',
      amount: earnedCoins,
      balanceBefore: before,
      balanceAfter: updated.coins,
      reason: 'game_win',
      gameId: payload.gameId,
      sessionId: payload.sessionId,
    });
    logger.info('claim success', {
      userId: uid,
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
