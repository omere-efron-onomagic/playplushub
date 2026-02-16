import type { Request, Response } from 'express';
import {
  getAllGamesAdmin,
  createGame,
  patchGame,
} from '../services/gameStore.service.js';
import { upsertLevels } from '../services/linkFourLevelStore.service.js';
import type { CreateGameBody, PatchGameBody, UpsertLevelsBody, CreateRoundBody } from '../types/game.types.js';
import { createRound } from '../services/linkFourLevelStore.service.js';
import { logger } from '../logger/logger.js';

/** POST /admin/games - create game */
export async function adminCreateGame(req: Request, res: Response) {
  try {
    const body = req.body as CreateGameBody;
    const game = await createGame(body);
    if (!game) {
      return res.status(409).json({ message: 'gameId already exists' });
    }
    return res.status(201).json(game);
  } catch (error) {
    logger.error('adminCreateGame failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** PATCH /admin/games/:gameId - update game */
export async function adminPatchGame(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const body = req.body as PatchGameBody;
    const game = await patchGame(gameId, body);
    if (!game) {
      return res.status(404).json({ message: 'game not found' });
    }
    return res.status(200).json(game);
  } catch (error) {
    logger.error('adminPatchGame failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** GET /admin/games - list all games (including disabled) */
export async function adminListGames(_req: Request, res: Response) {
  try {
    const games = await getAllGamesAdmin();
    return res.status(200).json({ games });
  } catch (error) {
    logger.error('adminListGames failed', { err: error });
    return res.status(500).json({ message: 'server error' });
  }
}

/** POST /admin/games/:gameId/levels - upsert levels */
export async function adminUpsertLevels(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const { levels } = req.body as UpsertLevelsBody;
    const updated = await upsertLevels(gameId, levels);
    return res.status(200).json({ levels: updated });
  } catch (error) {
    logger.error('adminUpsertLevels failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}

/** POST /admin/games/:gameId/rounds - create round (upload-first UX, auto extra letters) */
export async function adminCreateRound(req: Request, res: Response) {
  try {
    const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
    const { roundId, levels } = req.body as CreateRoundBody;
    const updated = await createRound(gameId, roundId, levels);
    return res.status(201).json({ levels: updated });
  } catch (error) {
    logger.error('adminCreateRound failed', { err: error, requestId: (req as Request & { requestId?: string }).requestId });
    return res.status(500).json({ message: 'server error' });
  }
}
