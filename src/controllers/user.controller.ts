import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { User } from '../models/User';

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw createHttpError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, role, shopId, isActive } = req.body as { name?: string; role?: string; shopId?: string | null; isActive?: boolean };
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, shopId: shopId ?? null, isActive },
      { new: true },
    );
    if (!user) throw createHttpError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw createHttpError(404, 'User not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


