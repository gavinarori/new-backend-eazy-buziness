import { Router } from 'express';
import {
  createSupply,
  listSupplies,
  updateSupply,
  deleteSupply,
} from '../controllers/supply.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const supplyRouter = Router();


supplyRouter.get('/', requireAuth, listSupplies);

supplyRouter.post('/', requireAuth, createSupply);

supplyRouter.patch('/:id', requireAuth, updateSupply);

supplyRouter.delete('/:id', requireAuth, deleteSupply);
