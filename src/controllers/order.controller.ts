import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Order } from '../models/Order';
import { Product } from '../models/Product';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { items, shopId } = req.body as any;
    if (!Array.isArray(items) || !items.length) throw createHttpError(400, 'No items');

    const productIds = items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const priceById = new Map(products.map((p) => [String(p._id), p.price]));
    const orderItems = items.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity,
      priceAtPurchase: priceById.get(String(i.productId)) || 0,
    }));
    const total = orderItems.reduce((sum: number, i: any) => sum + i.quantity * i.priceAtPurchase, 0);
    const order = await Order.create({ userId: req.user.id, shopId, items: orderItems, total });
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: any = {};
    if (req.user?.role === 'customer') filter.userId = req.user.id;
    if (req.user?.role === 'seller') filter.shopId = req.user.shopId;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: (req.body as any).status },
      { new: true },
    );
    if (!order) throw createHttpError(404, 'Order not found');
    res.json({ order });
  } catch (err) {
    next(err);
  }
}


