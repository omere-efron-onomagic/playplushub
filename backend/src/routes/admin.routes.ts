import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { uploadMiddleware } from '../services/upload.service.js';
import {
  adminCreateGame,
  adminPatchGame,
  adminListGames,
  adminUpsertLevels,
  adminCreateRound,
} from '../controllers/admin.controller.js';
import {
  adminUpsertPuzzle,
  adminBatchUpsertPuzzles,
  adminDeletePuzzle,
  adminUpsertHint,
  adminDeleteHint,
} from '../controllers/cinemojiAdmin.controller.js';
import { uploadImage } from '../controllers/upload.controller.js';
import {
  validateCreateGameBody,
  validatePatchGameBody,
  validateUpsertLevelsBody,
  validateCreateRoundBody,
} from '../validators/game.validator.js';
import {
  validateUpsertPuzzleBody,
  validateBatchUpsertPuzzlesBody,
  validateUpsertHintBody,
} from '../validators/cinemoji.validator.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/games', adminListGames);
adminRouter.post('/games', validateCreateGameBody, adminCreateGame);
adminRouter.patch('/games/:gameId', validatePatchGameBody, adminPatchGame);
adminRouter.post('/games/:gameId/levels', validateUpsertLevelsBody, adminUpsertLevels);
adminRouter.post('/games/:gameId/rounds', validateCreateRoundBody, adminCreateRound);
adminRouter.post('/uploads/images', uploadMiddleware.single('image'), uploadImage);

// Cinemoji admin endpoints
adminRouter.post('/cinemoji/puzzles', validateUpsertPuzzleBody, adminUpsertPuzzle);
adminRouter.post('/cinemoji/puzzles/batch', validateBatchUpsertPuzzlesBody, adminBatchUpsertPuzzles);
adminRouter.delete('/cinemoji/puzzles/:index', adminDeletePuzzle);
adminRouter.post('/cinemoji/hints', validateUpsertHintBody, adminUpsertHint);
adminRouter.delete('/cinemoji/hints', adminDeleteHint);
