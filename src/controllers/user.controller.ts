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
    const { name, email, password, role, shopId, phone, permissions, salesTarget, commissionRate } = req.body;
    const currentUser = (req as any).user;
    
    // Validate role permissions
    if (currentUser.role === 'seller' && role !== 'staff') {
      throw createHttpError(403, 'Sellers can only create staff members');
    }
    
    if (currentUser.role === 'admin' && !['staff', 'seller'].includes(role)) {
      throw createHttpError(403, 'Admins can only create staff and sellers');
    }
    
    // Set shopId based on current user's role
    let assignedShopId = shopId;
    if (currentUser.role === 'seller' || currentUser.role === 'admin') {
      assignedShopId = currentUser.shopId;
    }
    
    const user = new User({
      name,
      email,
      password,
      role,
      shopId: assignedShopId,
      phone,
      permissions: permissions || [],
      salesTarget: salesTarget || 100,
      commissionRate: commissionRate || 5,
      createdBy: currentUser._id,
      isActive: currentUser.role === 'superadmin' // Only superadmin can create active users
    });
    
    await user.save();
    
    const populatedUser = await User.findById(user._id)
      .populate('shopId', 'name')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ user: populatedUser });
  } catch (err) {
    next(err);
  }
}

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

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, role, shopId, isActive, phone, permissions, salesTarget, commissionRate } = req.body;
    const currentUser = (req as any).user;
    const userId = req.params.id;
    
    // Check if user exists and current user has permission to update
    const existingUser = await User.findById(userId);
    if (!existingUser) throw createHttpError(404, 'User not found');
    
    // Permission checks
    if (currentUser.role === 'seller' && existingUser.shopId?.toString() !== currentUser.shopId?.toString()) {
      throw createHttpError(403, 'You can only update staff in your shop');
    }
    
    if (currentUser.role === 'admin' && existingUser.shopId?.toString() !== currentUser.shopId?.toString()) {
      throw createHttpError(403, 'You can only update users in your shop');
    }
    
    const updateData: any = { name, phone, permissions, salesTarget, commissionRate };
    
    // Only superadmin can change role and shopId
    if (currentUser.role === 'superadmin') {
      updateData.role = role;
      updateData.shopId = shopId ?? null;
      updateData.isActive = isActive;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).populate('shopId', 'name').populate('createdBy', 'name email');
    
    if (!user) throw createHttpError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUser = (req as any).user;
    const userId = req.params.id;
    
    // Check if user exists and current user has permission to delete
    const existingUser = await User.findById(userId);
    if (!existingUser) throw createHttpError(404, 'User not found');
    
    // Permission checks
    if (currentUser.role === 'seller' && existingUser.shopId?.toString() !== currentUser.shopId?.toString()) {
      throw createHttpError(403, 'You can only delete staff in your shop');
    }
    
    if (currentUser.role === 'admin' && existingUser.shopId?.toString() !== currentUser.shopId?.toString()) {
      throw createHttpError(403, 'You can only delete users in your shop');
    }
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw createHttpError(404, 'User not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


