import { Request, Response, NextFunction } from 'express';
import { Settings } from '../models/Settings';

export async function upsertSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId, key, value } = req.body as any;
    const settings = await Settings.findOneAndUpdate({ shopId: shopId || null, key }, { value }, { upsert: true, new: true });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const settings = await Settings.find(shopId ? { shopId } : { shopId: null });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}


