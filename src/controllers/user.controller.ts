import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { User } from '../models/User';
import { Shop } from '../models/Shop';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query;

    let query: any = {};

    if (shopId) query.shopId = shopId;

    const users = await User.find(query)
      .populate('shopId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    next(err);
  }
}



export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      email,
      password,
      role,
      shopId,
      phone,
      permissions,
      salesTarget,
      commissionRate,
    } = req.body;

    const currentUser = (req as any).user;

    const user = new User({
      name,
      email,
      password: password || 'Temp@123',
      role,
      shopId: shopId?._id ?? shopId ?? null, 
      phone,
      permissions: permissions || [],
      salesTarget: salesTarget || 100,
      commissionRate: commissionRate || 5,
      createdBy: currentUser?._id,
      isActive: true,
    });

    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate('shopId', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({ user: populatedUser });
  } catch (err) {
    console.error('Error creating user:', err); // helpful for debugging
    next(err);
  }
}


// ====== GET USER ======
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.params.id)
      .populate('shopId', 'name')
      .populate('createdBy', 'name email');

    if (!user) throw createHttpError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// ====== UPDATE USER ======
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      role,
      shopId,
      isActive,
      phone,
      permissions,
      salesTarget,
      commissionRate,
    } = req.body;

    const userId = req.params.id;

    const existingUser = await User.findById(userId);
    if (!existingUser) throw createHttpError(404, 'User not found');

    const updateData: any = {
      name,
      role,
      shopId: shopId ?? null,
      isActive,
      phone,
      permissions,
      salesTarget,
      commissionRate,
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate('shopId', 'name')
      .populate('createdBy', 'name email');

    if (!user) throw createHttpError(404, 'User not found');

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// ====== DELETE USER ======
export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;

    const existingUser = await User.findById(userId);
    if (!existingUser) throw createHttpError(404, 'User not found');

    await User.findByIdAndDelete(userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
