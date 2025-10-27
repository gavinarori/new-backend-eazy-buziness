import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice';
import { Shop } from '../models/Shop';




export async function createOrUpdateInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      id,
      shopId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      status,
      createdBy,
    } = req.body as any;



    // ✅ Use createdBy from frontend (fallback to req.user if available)
    const currentUser = (req as any).user || {};
    const createdById =
      createdBy?.id || currentUser._id || null;

    if (!createdById) {
      return res.status(400).json({ message: 'Missing createdBy information.' });
    }

    // ✅ If updating
    if (id) {
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        id,
        {
          shopId,
          customerName,
          items,
          subtotal,
          tax,
          total,
          dueDate,
          status,
          createdBy: createdById,
        },
        { new: true, runValidators: true }
      );

      if (!updatedInvoice) {
        return res.status(404).json({ message: 'Invoice not found.' });
      }

      return res.status(200).json({
        message: 'Invoice updated successfully',
        invoice: updatedInvoice,
      });
    }

    // ✅ If creating new
    const newInvoice = await Invoice.create({
      shopId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      status,
      createdBy: createdById,
    });

    return res.status(201).json({
      message: 'Invoice created successfully',
      invoice: newInvoice,
    });
  } catch (err: any) {
    console.error('❌ createOrUpdateInvoice error:', err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
}

export async function updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status;
    await invoice.save();

    res.json({ message: 'Invoice status updated successfully', invoice });
  } catch (err) {
    console.error('❌ updateInvoiceStatus error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}




export async function listInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const currentUser = (req as any).user;

    let query: any = {};

    // Role-based filtering
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
      // Super admin and admin can see all invoices
      if (shopId) query.shopId = shopId;
    } else if (currentUser.role === 'seller') {
      // Sellers can see all invoices from their shop
      query.shopId = currentUser.shopId;
    } else if (currentUser.role === 'staff') {
      // Staff can only see invoices they created
      query.shopId = currentUser.shopId;
      query.createdBy = currentUser._id;
    } else {
      // Other roles see no invoices
      query._id = null;
    }

    const invoices = await Invoice.find(query)
      .populate('createdBy', 'name email')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
}


export async function deleteInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    next(err);
  }
}
