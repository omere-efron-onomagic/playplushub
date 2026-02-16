import { Router } from 'express';
import {
  continueMode2Lives,
  getCinemojiContent,
  getStageHint,
  refreshCinemojiContent,
  submitMode1Guess,
  submitMode2Match,
} from '../controllers/cinemoji.controller.js';
import {
  validateContinueLivesBody,
  validateHintBody,
  validateMode1SubmitBody,
  validateMode2SubmitBody,
} from '../validators/cinemoji.validator.js';

export const cinemojiRouter = Router();

cinemojiRouter.get('/content', getCinemojiContent);
cinemojiRouter.post('/content/reload', refreshCinemojiContent);
cinemojiRouter.post('/mode1/submit', validateMode1SubmitBody, submitMode1Guess);
cinemojiRouter.post('/mode2/submit', validateMode2SubmitBody, submitMode2Match);
cinemojiRouter.post('/hint', validateHintBody, getStageHint);
cinemojiRouter.post('/mode2/lives/continue', validateContinueLivesBody, continueMode2Lives);
