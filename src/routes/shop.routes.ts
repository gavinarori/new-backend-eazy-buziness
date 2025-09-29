import { Router } from 'express';
import { createShop, listShops, getShop, updateShop, deleteShop, approveShop, rejectShop } from '../controllers/shop.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const shopRouter = Router();

shopRouter.get('/', listShops);
shopRouter.get('/:id', getShop);
shopRouter.post('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), createShop);
shopRouter.patch('/:id', requireAuth, requireRoles('seller', 'admin', 'superadmin'), updateShop);
shopRouter.delete('/:id', requireAuth, requireRoles('admin', 'superadmin'), deleteShop);
shopRouter.post('/:id/approve', requireAuth, requireRoles('superadmin'), approveShop);
shopRouter.post('/:id/reject', requireAuth, requireRoles('superadmin'), rejectShop);


