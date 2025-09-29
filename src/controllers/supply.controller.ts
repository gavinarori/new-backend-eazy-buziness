import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Supply } from '../models/Supply';
import { Product } from '../models/Product';
import { InventoryTransaction } from '../models/InventoryTransaction';

export async function createSupply(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { shopId, supplierName, items, receivedAt } = req.body as any;
    if (!Array.isArray(items) || !items.length) throw createHttpError(400, 'No items');
    const totalCost = items.reduce((s: number, i: any) => s + i.quantity * i.unitCost, 0);
    const supply = await Supply.create({ shopId, supplierName, items, totalCost, receivedAt });
    // bump stock and record inventory transactions
    for (const i of items) {
      await Product.findByIdAndUpdate(i.productId, { $inc: { stock: i.quantity } });
      await InventoryTransaction.create({ shopId, productId: i.productId, type: 'supply', quantity: i.quantity, note: `Supply ${supply._id}` });
    }
    res.status(201).json({ supply });
  } catch (err) {
    next(err);
  }
}

export async function listSupplies(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const filter: any = {};
    if (shopId) filter.shopId = shopId;
    const supplies = await Supply.find(filter).sort({ createdAt: -1 });
    res.json({ supplies });
  } catch (err) {
    next(err);
  }
}


