import { Router } from 'express';
import { upsertSetting, getSettings } from '../controllers/settings.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const settingsRouter = Router();

settingsRouter.get('/', requireAuth, getSettings);
settingsRouter.post('/', requireAuth, upsertSetting);


