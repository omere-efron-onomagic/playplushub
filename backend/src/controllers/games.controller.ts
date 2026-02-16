import type { Request, Response } from 'express';
import { getAllGames, getGameById } from '../services/gameStore.service.js';
import {
  getLevelsForGame,
  getRoundsForGame,
  getLevelsForRound,
} from '../services/linkFourLevelStore.service.js';
import { getCompletedRounds } from '../services/progressionStore.service.js';
import { logger } from '../logger/logger.js';

/** GET /games - list all enabled games */
export async function listGames(req: Request, res: Response) {
  try {
    const games = await getAllGames();
    return res.status(200).json({ games });
  } catch (error) {
    logger.error('listGames failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /games/:gameId - get single game */
export async function getGame(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'game not found' });
    }
    return res.status(200).json(game);
  } catch (error) {
    logger.error('getGame failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /games/:gameId/levels - get Link Four levels for game (flat, all rounds) */
export async function getGameLevels(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const levels = await getLevelsForGame(gameId);
    return res.status(200).json({ levels });
  } catch (error) {
    logger.error('getGameLevels failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /games/:gameId/rounds - get rounds for game (public) */
export async function getGameRounds(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const byRound = await getRoundsForGame(gameId);
    const rounds = Array.from(byRound.entries()).map(([roundId, levels]) => ({
      roundId,
      levels,
    }));
    return res.status(200).json({ rounds });
  } catch (error) {
    logger.error('getGameRounds failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /games/:gameId/rounds/:roundId/levels - get levels for a specific round */
export async function getRoundLevels(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const roundId = Array.isArray(req.params.roundId) ? req.params.roundId[0] : req.params.roundId;
    const levels = await getLevelsForRound(gameId, roundId);
    if (levels.length === 0) {
      return res.status(404).json({ message: 'round not found' });
    }
    return res.status(200).json({ levels });
  } catch (error) {
    logger.error('getRoundLevels failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /games/:gameId/progress - get user/guest completed rounds (auth required) */
export async function getGameProgress(req: Request, res: Response) {
  try {
    const authUserId = req.authUserId;
    const guestId = req.guestId;
    const actorId = authUserId ?? guestId;
    const isGuest = !!guestId;
    if (!actorId) {
      return res.status(401).json({ message: 'authorization or guest token required' });
    }
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const completedRoundIds = await getCompletedRounds(actorId, isGuest ? 'guest' : 'user', gameId);
    return res.status(200).json({ completedRoundIds });
  } catch (error) {
    logger.error('getGameProgress failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}
