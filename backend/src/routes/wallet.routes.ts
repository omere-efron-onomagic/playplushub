import { Router } from 'express';
import { rewardCoins } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRewardBody } from '../validators/wallet.validator.js';

export const walletRouter = Router();

walletRouter.post('/reward', requireAuth, validateRewardBody, rewardCoins);
