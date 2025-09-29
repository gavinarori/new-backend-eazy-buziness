import { Router } from 'express';
import { createOrder, listOrders, updateOrderStatus } from '../controllers/order.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const orderRouter = Router();

orderRouter.get('/', requireAuth, listOrders);
orderRouter.post('/', requireAuth, createOrder);
orderRouter.patch('/:id/status', requireAuth, requireRoles('seller', 'admin', 'superadmin'), updateOrderStatus);


