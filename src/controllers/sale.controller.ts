import { Request, Response, NextFunction } from 'express';
import { Sale } from '../models/Sale';
import { Shop } from '../models/Shop';

/**
 * Create a new sale
 */
export async function createSale(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      shopId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      createdBy,
    } = req.body;

    if (!shopId || !customerName || !items?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch VAT rate from shop
    const shop = await Shop.findById(shopId);
    const vatRate = shop?.vatRate || 0;

    // Recalculate totals to ensure consistency
    const cleanItems = items.map((item: any) => ({
      productId: item.productId || null,
      description: item.description || 'Unnamed Item',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }));

 

    const userId =
      (req as any).user?._id || createdBy?.id || null;

    if (!userId) {
      return res.status(400).json({ message: 'Missing createdBy user' });
    }

    const sale = await Sale.create({
      shopId,
      customerName,
      items: cleanItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      createdBy: userId,
    });

    return res.status(201).json({
      message: 'Sale created successfully',
      sale,
    });
  } catch (err) {
    console.error('Error creating sale:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
}

/**
 * List all sales
 */
export async function listSales(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const currentUser = (req as any).user;

    let query: any = {};

    if (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') {
      if (shopId) query.shopId = shopId;
    } else if (currentUser?.role === 'seller') {
      query.shopId = currentUser.shopId;
    } else if (currentUser?.role === 'staff') {
      query.shopId = currentUser.shopId;
      query.createdBy = currentUser._id;
    } else {
      query._id = null;
    }

    const sales = await Sale.find(query)
      .populate('createdBy', 'name email')
      .populate('shopId', 'name')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });

    res.json({ sales });
  } catch (err) {
    console.error('Error listing sales:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
}

/**
 * Get a single sale by ID
 */
export async function getSale(req: Request, res: Response) {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('shopId', 'name')
      .populate('items.productId', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ sale });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err });
  }
}

/**
 * Delete a sale
 */
export async function deleteSale(req: Request, res: Response) {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err });
  }
}
