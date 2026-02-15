import { Router } from 'express';
import { rewardCoins, startSession, claimSession } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validateRewardBody,
  validateSessionStartBody,
  validateSessionClaimBody,
} from '../validators/wallet.validator.js';

export const walletRouter = Router();

walletRouter.post('/reward', requireAuth, validateRewardBody, rewardCoins);
walletRouter.post('/session/start', requireAuth, validateSessionStartBody, startSession);
walletRouter.post('/session/claim', requireAuth, validateSessionClaimBody, claimSession);
