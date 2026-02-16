import { Router } from 'express';
import {
  completeCinemojiStage,
  continueMode2Lives,
  getCinemojiContent,
  getCinemojiStageProgress,
  getStageHint,
  refreshCinemojiContent,
  submitMode1Guess,
  submitMode2Match,
} from '../controllers/cinemoji.controller.js';
import { requireAuthOrGuest } from '../middleware/auth.middleware.js';
import {
  validateContinueLivesBody,
  validateHintBody,
  validateMode1SubmitBody,
  validateMode2SubmitBody,
  validateStageCompleteBody,
} from '../validators/cinemoji.validator.js';

export const cinemojiRouter = Router();

cinemojiRouter.get('/content', getCinemojiContent);
cinemojiRouter.post('/content/reload', refreshCinemojiContent);
cinemojiRouter.post('/mode1/submit', validateMode1SubmitBody, submitMode1Guess);
cinemojiRouter.post('/mode2/submit', validateMode2SubmitBody, submitMode2Match);
cinemojiRouter.post('/hint', validateHintBody, getStageHint);
cinemojiRouter.post('/mode2/lives/continue', validateContinueLivesBody, continueMode2Lives);
cinemojiRouter.get('/progress', requireAuthOrGuest, getCinemojiStageProgress);
cinemojiRouter.post('/progress/complete', requireAuthOrGuest, validateStageCompleteBody, completeCinemojiStage);
