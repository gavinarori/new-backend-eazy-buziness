import { Router } from 'express';
import { createSupply, listSupplies } from '../controllers/supply.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const supplyRouter = Router();

supplyRouter.get('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), listSupplies);
supplyRouter.post('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), createSupply);


