import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';

export async function dashboardMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const [ordersCount, productsCount, shopsPending, revenueAgg] = await Promise.all([
      Order.countDocuments({}),
      Product.countDocuments({}),
      Shop.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'completed'] } } },
        { $group: { _id: null, revenue: { $sum: '$total' } } },
      ]),
    ]);
    const revenue = revenueAgg[0]?.revenue || 0;
    res.json({ ordersCount, productsCount, shopsPending, revenue });
  } catch (err) {
    next(err);
  }
}

export async function salesSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { start, end, shopId } = req.query as any;
    const match: any = { status: { $in: ['paid', 'completed'] } };
    if (start || end) match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(String(start));
    if (end) match.createdAt.$lte = new Date(String(end));
    if (shopId) match.shopId = shopId;

    const data = await Order.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ series: data });
  } catch (err) {
    next(err);
  }
}


