import { Router } from 'express';
import {
  createOrUpdateInvoice,
  listInvoices,
  deleteInvoice,
  updateInvoiceStatus
} from '../controllers/invoice.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const invoiceRouter = Router();


invoiceRouter.get('/', requireAuth, listInvoices);
invoiceRouter.post('/', requireAuth, createOrUpdateInvoice);
invoiceRouter.patch('/:id', requireAuth, createOrUpdateInvoice);
invoiceRouter.put('/:id', requireAuth, updateInvoiceStatus);
invoiceRouter.delete('/:id', requireAuth, deleteInvoice);
