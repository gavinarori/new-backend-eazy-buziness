import { Router } from 'express';
import {
  createOrUpdateInvoice,
  listInvoices,
  deleteInvoice,
} from '../controllers/invoice.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const invoiceRouter = Router();


invoiceRouter.get('/', requireAuth, listInvoices);
invoiceRouter.post('/', requireAuth, createOrUpdateInvoice);
invoiceRouter.patch('/:id', requireAuth, createOrUpdateInvoice);
invoiceRouter.delete('/:id', requireAuth, deleteInvoice);
