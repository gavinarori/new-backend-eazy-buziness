import { Router } from 'express';
import { login, register, me, logout } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, me);
authRouter.post('/logout', requireAuth, logout);


