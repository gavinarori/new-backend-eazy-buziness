import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';
import { Invoice } from '../models/Invoice';
import { Sale } from '../models/Sale';
import { User } from '../models/User';

export async function dashboardMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUser = (req as any).user;
    const { shopId } = req.query as any;

    // Role-based metrics
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
      // Admin/Superadmin metrics
      const [
        totalBusinesses,
        pendingBusinesses,
        totalUsers,
        pendingUsers,
        totalRevenue,
        totalInvoices,
        totalSales
      ] = await Promise.all([
        Shop.countDocuments({}),
        Shop.countDocuments({ status: 'pending' }),
        User.countDocuments({}),
        User.countDocuments({ role: 'customer' }),
        Invoice.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, revenue: { $sum: '$total' } } }
        ]),
        Invoice.countDocuments({}),
        Sale.countDocuments({})
      ]);

      res.json({
        totalBusinesses,
        pendingBusinesses,
        totalUsers,
        pendingUsers,
        totalRevenue: totalRevenue[0]?.revenue || 0,
        totalInvoices,
        totalSales
      });
    } else {
      // Seller/Staff metrics (existing logic)
      const shopFilter = currentUser.role === 'seller' ? { shopId: currentUser.shopId } : 
                        currentUser.role === 'staff' ? { shopId: currentUser.shopId, createdBy: currentUser._id } : 
                        shopId ? { shopId } : {};

      const [
        ordersCount,
        productsCount,
        revenueAgg,
        invoicesCount,
        salesCount,
        pendingInvoices
      ] = await Promise.all([
        Order.countDocuments(shopFilter),
        Product.countDocuments(shopFilter),
        Invoice.aggregate([
          { $match: { ...shopFilter, status: 'paid' } },
          { $group: { _id: null, revenue: { $sum: '$total' } } }
        ]),
        Invoice.countDocuments(shopFilter),
        Sale.countDocuments(shopFilter),
        Invoice.countDocuments({ ...shopFilter, status: { $in: ['draft', 'sent'] } })
      ]);

      const revenue = revenueAgg[0]?.revenue || 0;
      res.json({ 
        ordersCount, 
        productsCount, 
        revenue, 
        invoicesCount,
        salesCount,
        pendingInvoices
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function salesSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { start, end, shopId } = req.query as any;
    const currentUser = (req as any).user;
    
    // Role-based filtering
    let match: any = { status: 'paid' };
    if (start || end) match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(String(start));
    if (end) match.createdAt.$lte = new Date(String(end));
    
    if (currentUser.role === 'seller') {
      match.shopId = currentUser.shopId;
    } else if (currentUser.role === 'staff') {
      match.shopId = currentUser.shopId;
      match.createdBy = currentUser._id;
    } else if (shopId) {
      match.shopId = shopId;
    }

    const data = await Invoice.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ series: data });
  } catch (err) {
    next(err);
  }
}

export async function productAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUser = (req as any).user;
    const { shopId } = req.query as any;
    
    let match: any = {};
    if (currentUser.role === 'seller') {
      match.shopId = currentUser.shopId;
    } else if (currentUser.role === 'staff') {
      match.shopId = currentUser.shopId;
    } else if (shopId) {
      match.shopId = shopId;
    }

    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      topSellingProducts,
      categoryAnalysis
    ] = await Promise.all([
      Product.countDocuments(match),
      Product.countDocuments({ ...match, stock: { $gt: 0 } }),
      Product.countDocuments({ ...match, stock: { $lte: 5 } }),
      Product.aggregate([
        { $match: match },
        { $lookup: { from: 'invoices', localField: '_id', foreignField: 'items.productId', as: 'invoices' } },
        { $lookup: { from: 'sales', localField: '_id', foreignField: 'items.productId', as: 'sales' } },
        { $addFields: { 
          totalSold: { $add: [
            { $sum: '$invoices.items.quantity' },
            { $sum: '$sales.items.quantity' }
          ]},
          totalRevenue: { $add: [
            { $sum: '$invoices.items.unitPrice' },
            { $sum: '$sales.items.unitPrice' }
          ]}
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]),
      Product.aggregate([
        { $match: match },
        { $group: { 
          _id: '$categoryId', 
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
        }},
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalProducts,
      activeProducts,
      lowStockProducts,
      topSellingProducts,
      categoryAnalysis
    });
  } catch (err) {
    next(err);
  }
}

export async function staffPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUser = (req as any).user;
    const { shopId } = req.query as any;
    
    let match: any = {};
    if (currentUser.role === 'seller') {
      match.shopId = currentUser.shopId;
    } else if (currentUser.role === 'staff') {
      match.shopId = currentUser.shopId;
      match.createdBy = currentUser._id;
    } else if (shopId) {
      match.shopId = shopId;
    }

    const staffMembers = await User.find({ 
      role: 'staff',
      ...(currentUser.role === 'seller' ? { shopId: currentUser.shopId } : shopId ? { shopId } : {})
    });

    const staffPerformance = await Promise.all(
      staffMembers.map(async (staff) => {
        const [invoices, sales] = await Promise.all([
          Invoice.find({ ...match, createdBy: staff._id }),
          Sale.find({ ...match, createdBy: staff._id })
        ]);

        const totalSales = invoices.length + sales.length;
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0) + 
                           sales.reduce((sum, sale) => sum + sale.total, 0);
        const commission = totalRevenue * ((staff.commissionRate || 5) / 100);
        const target = staff.salesTarget || 100;
        const achievement = (totalSales / target) * 100;

        return {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          totalSales,
          totalRevenue,
          commission,
          target,
          achievement: Math.round(achievement * 100) / 100,
          commissionRate: staff.commissionRate || 5
        };
      })
    );

    res.json({ staffPerformance });
  } catch (err) {
    next(err);
  }
}


