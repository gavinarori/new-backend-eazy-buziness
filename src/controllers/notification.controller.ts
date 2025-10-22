import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

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

// Computed alerts across products, invoices, and supplies
export async function listComputedAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const { Product } = await import('../models/Product');
    const { Invoice } = await import('../models/Invoice');
    const { Supply } = await import('../models/Supply');
    const { Shop } = await import('../models/Shop');

    const queryShopId = (req.query.shopId as string | undefined) || null;
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin');

    // Resolve which shops to include
    let shopFilter: any = {};
    if (isAdmin) {
      if (queryShopId) {
        shopFilter = { shopId: queryShopId };
      } else {
        shopFilter = {}; // all shops
      }
    } else {
      const userShopId = req.user?.shopId;
      if (!userShopId) {
        return res.json({ items: [] });
      }
      shopFilter = { shopId: String(userShopId) };
    }

    // Build product alerts (low/out of stock)
    const products = await Product.find(shopFilter as any).lean();
    const shopIdsSet = new Set<string>(products.map(p => String(p.shopId)));

    // Also include shops referenced by invoices/supplies if admin/all
    const extraFilters: any = {};
    if (isAdmin && queryShopId) extraFilters.shopId = new mongoose.Types.ObjectId(queryShopId);
    if (!isAdmin && req.user?.shopId) extraFilters.shopId = new mongoose.Types.ObjectId(String(req.user.shopId));

    const [invoices, supplies] = await Promise.all([
      Invoice.find(extraFilters).lean(),
      Supply.find(extraFilters).lean(),
    ]);
    invoices.forEach(inv => shopIdsSet.add(String(inv.shopId)));
    supplies.forEach(s => shopIdsSet.add(String(s.shopId)));

    const shops = await Shop.find({ _id: { $in: Array.from(shopIdsSet).map(id => new mongoose.Types.ObjectId(id)) } }).lean();
    const shopIdToName = new Map<string, string>(shops.map(s => [String(s._id), s.name]));

    const items: Array<{ id: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; read: boolean; createdAt: Date }> = [];

    // Low stock and out of stock
    for (const p of products) {
      const stock: number = (p as any).stock ?? 0;
      const minStock: number = (p as any).minStock ?? 0;
      const shopName = shopIdToName.get(String((p as any).shopId));
      const shopPrefix = isAdmin && !queryShopId ? `[${shopName ?? 'Unknown Shop'}] ` : '';
      if (stock === 0) {
        items.push({
          id: `out-of-stock-${(p as any)._id}`,
          title: 'Out of Stock Alert',
          message: `${shopPrefix}${(p as any).name} is completely out of stock. Immediate restocking required.`,
          type: 'error',
          read: false,
          createdAt: new Date((p as any).updatedAt || Date.now()),
        });
      } else if (stock <= minStock) {
        items.push({
          id: `low-stock-${(p as any)._id}`,
          title: 'Low Stock Alert',
          message: `${shopPrefix}${(p as any).name} is running low (${stock} units remaining). Minimum stock level is ${minStock} units.`,
          type: 'warning',
          read: false,
          createdAt: new Date((p as any).updatedAt || Date.now()),
        });
      }
    }

    // Invoice: Payment received (status paid)
    for (const inv of invoices) {
      if ((inv as any).status === 'paid') {
        const shopName = shopIdToName.get(String((inv as any).shopId));
        const shopPrefix = isAdmin && !queryShopId ? `[${shopName ?? 'Unknown Shop'}] ` : '';
        const total = (inv as any).total ?? 0;
        items.push({
          id: `invoice-paid-${(inv as any)._id}`,
          title: 'Invoice Payment Received',
          message: `${shopPrefix}Invoice for ${((inv as any).customerName || 'customer')} has been paid ($${Number(total).toFixed(2)}).`,
          type: 'success',
          read: false,
          createdAt: new Date((inv as any).updatedAt || (inv as any).createdAt || Date.now()),
        });
      }
    }

    // Invoice: Overdue (status sent and dueDate past now)
    const now = new Date();
    for (const inv of invoices) {
      const status = (inv as any).status;
      const dueDate: Date | null = (inv as any).dueDate ? new Date((inv as any).dueDate) : null;
      if (status === 'sent' && dueDate && dueDate.getTime() < now.getTime()) {
        const shopName = shopIdToName.get(String((inv as any).shopId));
        const shopPrefix = isAdmin && !queryShopId ? `[${shopName ?? 'Unknown Shop'}] ` : '';
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const total = (inv as any).total ?? 0;
        items.push({
          id: `invoice-overdue-${(inv as any)._id}`,
          title: 'Overdue Invoice',
          message: `${shopPrefix}Invoice for ${((inv as any).customerName || 'customer')} is ${daysOverdue} day(s) overdue ($${Number(total).toFixed(2)}).`,
          type: 'error',
          read: false,
          createdAt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000),
        });
      }
    }

    // Supplies received
    for (const s of supplies) {
      const shopName = shopIdToName.get(String((s as any).shopId));
      const shopPrefix = isAdmin && !queryShopId ? `[${shopName ?? 'Unknown Shop'}] ` : '';
      const receivedAt = (s as any).receivedAt ? new Date((s as any).receivedAt) : new Date((s as any).createdAt || Date.now());
      const supplierName = (s as any).supplierName || 'supplier';
      const totalCost = (s as any).totalCost ?? 0;
      items.push({
        id: `supply-received-${(s as any)._id}`,
        title: 'Supply Delivery Received',
        message: `${shopPrefix}New supply delivery received from ${supplierName}. Total cost $${Number(totalCost).toFixed(2)}.`,
        type: 'info',
        read: false,
        createdAt: receivedAt,
      });
    }

    // Sort by createdAt desc
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ items });
  } catch (err) {
    next(err);
  }
}


