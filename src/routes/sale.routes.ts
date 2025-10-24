import { Router } from 'express';
import {
  createSale,
  listSales,
  getSale,
  deleteSale,
} from '../controllers/sale.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const saleRouter = Router();

saleRouter.get('/', requireAuth, listSales);
saleRouter.post('/', requireAuth, createSale);
saleRouter.get('/:id', requireAuth, getSale);
saleRouter.delete('/:id', requireAuth, deleteSale);
