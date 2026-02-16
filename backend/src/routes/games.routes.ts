import { Router } from 'express';
import { requireAuthOrGuest } from '../middleware/auth.middleware.js';
import {
  listGames,
  getGame,
  getGameLevels,
  getGameRounds,
  getRoundLevels,
  getGameProgress,
} from '../controllers/games.controller.js';

export const gamesRouter = Router();

gamesRouter.get('/', listGames);
gamesRouter.get('/:gameId', getGame);
gamesRouter.get('/:gameId/levels', getGameLevels);
gamesRouter.get('/:gameId/rounds', getGameRounds);
gamesRouter.get('/:gameId/rounds/:roundId/levels', getRoundLevels);
gamesRouter.get('/:gameId/progress', requireAuthOrGuest, getGameProgress);
