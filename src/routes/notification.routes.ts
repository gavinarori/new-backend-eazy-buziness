import { Router } from 'express';
import { listNotifications, markNotificationRead } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, listNotifications);
notificationRouter.post('/:id/read', requireAuth, markNotificationRead);


