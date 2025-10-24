import { Request, Response, NextFunction } from 'express';
import { Sale } from '../models/Sale';
import { Shop } from '../models/Shop';

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
    } = req.body as any;

    const currentUser = (req as any).user;

    // Create new sale with VAT calculation
    const shop = await Shop.findById(shopId);
    const vatRate = shop?.vatRate || 0;
    
    // Calculate VAT based on shop's VAT rate
    const calculatedTax = subtotal * (vatRate / 100);
    const calculatedTotal = subtotal + calculatedTax;

    const sale = await Sale.create({
      shopId,
      customerName,
      items,
      subtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      paymentMethod,
      createdBy: currentUser._id,
    });

    return res.status(201).json({
      message: 'Sale created successfully',
      sale,
    });
  } catch (err) {
    next(err);
  }
}

export async function listSales(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const currentUser = (req as any).user;

    let query: any = {};

    // Role-based filtering
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
      // Super admin and admin can see all sales
      if (shopId) query.shopId = shopId;
    } else if (currentUser.role === 'seller') {
      // Sellers can see all sales from their shop
      query.shopId = currentUser.shopId;
    } else if (currentUser.role === 'staff') {
      // Staff can only see sales they created
      query.shopId = currentUser.shopId;
      query.createdBy = currentUser._id;
    } else {
      // Other roles see no sales
      query._id = null;
    }

    const sales = await Sale.find(query)
      .populate('createdBy', 'name email')
      .populate('shopId', 'name')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ sales });
  } catch (err) {
    next(err);
  }
}

export async function getSale(req: Request, res: Response, next: NextFunction) {
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
    next(err);
  }
}

export async function deleteSale(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    next(err);
  }
}
