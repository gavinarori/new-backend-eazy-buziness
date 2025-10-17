import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Supply } from '../models/Supply';
import { Product } from '../models/Product';
import { InventoryTransaction } from '../models/InventoryTransaction';

/**
 * Create a new supply record
 */
export async function createSupply(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');

    const { shopId, supplierName, items, receivedAt } = req.body as any;
    if (!Array.isArray(items) || !items.length) throw createHttpError(400, 'No items provided');

    const totalCost = items.reduce((s: number, i: any) => s + i.quantity * i.unitCost, 0);
    const supply = await Supply.create({ shopId, supplierName, items, totalCost, receivedAt });

    // Increase stock & record inventory transactions
    for (const i of items) {
      await Product.findByIdAndUpdate(i.productId, { $inc: { stock: i.quantity } });
      await InventoryTransaction.create({
        shopId,
        productId: i.productId,
        type: 'supply',
        quantity: i.quantity,
        note: `Supply created: ${supply._id}`,
      });
    }

    res.status(201).json({ supply });
  } catch (err) {
    next(err);
  }
}

/**
 * List supplies (filtered by shop)
 */
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

/**
 * Update a supply record
 */
export async function updateSupply(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');

    const { id } = req.params;
    const { supplierName, items, receivedAt, status, notes } = req.body as any;

    const existingSupply:any = await Supply.findById(id);
    if (!existingSupply) throw createHttpError(404, 'Supply not found');

    // Revert previous stock before applying new quantities
    for (const oldItem of existingSupply.items) {
      await Product.findByIdAndUpdate(oldItem.productId, { $inc: { stock: -oldItem.quantity } });
      await InventoryTransaction.create({
        shopId: existingSupply.shopId,
        productId: oldItem.productId,
        type: 'adjustment',
        quantity: -oldItem.quantity,
        note: `Revert old supply quantities for update: ${id}`,
      });
    }

    // Calculate new total
    const totalCost = items.reduce((s: number, i: any) => s + i.quantity * i.unitCost, 0);

    // Update the supply
    existingSupply.supplierName = supplierName;
    existingSupply.items = items;
    existingSupply.receivedAt = receivedAt;
    existingSupply.totalCost = totalCost;
    existingSupply.notes = notes || existingSupply.notes;

    await existingSupply.save();

    // Re-apply stock with updated quantities
    for (const i of items) {
      await Product.findByIdAndUpdate(i.productId, { $inc: { stock: i.quantity } });
      await InventoryTransaction.create({
        shopId: existingSupply.shopId,
        productId: i.productId,
        type: 'supply',
        quantity: i.quantity,
        note: `Supply updated: ${id}`,
      });
    }

    res.json({ supply: existingSupply });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a supply record
 */
export async function deleteSupply(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { id } = req.params;

    const supply = await Supply.findById(id);
    if (!supply) throw createHttpError(404, 'Supply not found');

    // Roll back product stock
    for (const i of supply.items) {
      await Product.findByIdAndUpdate(i.productId, { $inc: { stock: -i.quantity } });
      await InventoryTransaction.create({
        shopId: supply.shopId,
        productId: i.productId,
        type: 'adjustment',
        quantity: -i.quantity,
        note: `Supply deleted: ${id}`,
      });
    }

    await Supply.findByIdAndDelete(id);
    res.json({ message: 'Supply deleted successfully' });
  } catch (err) {
    next(err);
  }
}
