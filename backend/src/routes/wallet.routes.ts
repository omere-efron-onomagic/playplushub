import { Router } from 'express';
import { rewardCoins, startSession, claimSession } from '../controllers/wallet.controller.js';
import { requireAuth, requireAuthOrGuest } from '../middleware/auth.middleware.js';
import {
  validateRewardBody,
  validateSessionStartBody,
  validateSessionClaimBody,
} from '../validators/wallet.validator.js';

export const walletRouter = Router();

walletRouter.post('/reward', requireAuth, validateRewardBody, rewardCoins);
walletRouter.post('/session/start', requireAuthOrGuest, validateSessionStartBody, startSession);
walletRouter.post('/session/claim', requireAuthOrGuest, validateSessionClaimBody, claimSession);
