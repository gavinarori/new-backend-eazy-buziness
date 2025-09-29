import { Router } from 'express';
import { createInvoice, listInvoices, updateInvoiceStatus } from '../controllers/invoice.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const invoiceRouter = Router();

invoiceRouter.get('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), listInvoices);
invoiceRouter.post('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), createInvoice);
invoiceRouter.patch('/:id/status', requireAuth, requireRoles('seller', 'admin', 'superadmin'), updateInvoiceStatus);


