import { Router } from 'express';
import {
  login,
  me,
  register,
  createGuest,
  getGuest,
  updateGuestProgression,
  migrateGuest,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validateLoginBody,
  validateRegisterBody,
  requireGuestToken,
  validateGuestUpdateBody,
  validateMigrateBody,
} from '../validators/auth.validator.js';

export const authRouter = Router();

// Existing auth endpoints (backward-compatible)
authRouter.post('/register', validateRegisterBody, register);
authRouter.post('/login', validateLoginBody, login);
authRouter.get('/me', requireAuth, me);

// Guest lifecycle endpoints
authRouter.post('/guest', createGuest);
authRouter.get('/guest', requireGuestToken, getGuest);
authRouter.patch('/guest', requireGuestToken, validateGuestUpdateBody, updateGuestProgression);

// Migration endpoint (requires auth token + guest token in body)
authRouter.post('/guest/migrate', requireAuth, validateMigrateBody, migrateGuest);
