import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice';

export async function createInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId, customerName, items, subtotal, tax, total, dueDate } = req.body as any;
    const invoice = await Invoice.create({ shopId, customerName, items, subtotal, tax, total, dueDate });
    res.status(201).json({ invoice });
  } catch (err) {
    next(err);
  }
}

export async function listInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const invoices = await Invoice.find(shopId ? { shopId } : {}).sort({ createdAt: -1 });
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
}

export async function updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: (req.body as any).status }, { new: true });
    res.json({ invoice });
  } catch (err) {
    next(err);
  }
}


