import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.json({ notifications: [] });
    const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications: notifs });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ notification: notif });
  } catch (err) {
    next(err);
  }
}


