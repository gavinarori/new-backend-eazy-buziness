import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { User } from '../models/User';
import { Shop } from '../models/Shop';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query;
    const currentUser = (req as any).user;

    let query: any = {};

    // Role-based filtering
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
      // Super admin and admin can see all users
      if (shopId) query.shopId = shopId;
    } else if (currentUser.role === 'seller') {
      // Sellers can only see staff users under their shop
      query.shopId = currentUser.shopId?._id;
      query.role = 'staff';
    } else if (currentUser.role === 'staff') {
      // Staff can only see themselves
      query._id = currentUser._id;
    } else {
      // Other roles see no users
      query._id = null;
    }

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
