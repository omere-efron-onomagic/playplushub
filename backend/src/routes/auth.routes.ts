import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateLoginBody, validateRegisterBody } from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', validateRegisterBody, register);
authRouter.post('/login', validateLoginBody, login);
authRouter.get('/me', requireAuth, me);
