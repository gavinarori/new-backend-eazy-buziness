import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice';


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
    } = req.body as any;

    let invoice;

    if (id) {
   
      invoice = await Invoice.findByIdAndUpdate(
        id,
        { shopId, customerName, items, subtotal, tax, total, dueDate, status },
        { new: true, runValidators: true }
      );

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      return res.status(200).json({
        message: 'Invoice updated successfully',
        invoice,
      });
    }

  
    invoice = await Invoice.create({
      shopId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      status,
    });

    return res.status(201).json({
      message: 'Invoice created successfully',
      invoice,
    });
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
