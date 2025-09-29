import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Shop } from '../models/Shop';

export async function createShop(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { name, description } = req.body as { name: string; description?: string };
    const shop = await Shop.create({ name, description, ownerId: req.user.id, status: 'pending' });
    res.status(201).json({ shop });
  } catch (err) {
    next(err);
  }
}

export async function listShops(_req: Request, res: Response, next: NextFunction) {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json({ shops });
  } catch (err) {
    next(err);
  }
}

export async function getShop(req: Request, res: Response, next: NextFunction) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) throw createHttpError(404, 'Shop not found');
    res.json({ shop });
  } catch (err) {
    next(err);
  }
}

export async function updateShop(req: Request, res: Response, next: NextFunction) {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shop) throw createHttpError(404, 'Shop not found');
    res.json({ shop });
  } catch (err) {
    next(err);
  }
}

export async function deleteShop(req: Request, res: Response, next: NextFunction) {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) throw createHttpError(404, 'Shop not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function approveShop(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const shop = await Shop.findById(req.params.id);
    if (!shop) throw createHttpError(404, 'Shop not found');
    shop.status = 'approved';
    shop.approvedBy = req.user.id as any;
    shop.approvedAt = new Date();
    await shop.save();
    res.json({ shop });
  } catch (err) {
    next(err);
  }
}

export async function rejectShop(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const shop = await Shop.findById(req.params.id);
    if (!shop) throw createHttpError(404, 'Shop not found');
    shop.status = 'rejected';
    shop.approvedBy = req.user.id as any;
    shop.approvedAt = new Date();
    await shop.save();
    res.json({ shop });
  } catch (err) {
    next(err);
  }
}


