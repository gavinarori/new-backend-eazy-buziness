import { Router } from 'express';
import { dashboardMetrics, salesSummary } from '../controllers/report.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const reportRouter = Router();

reportRouter.get('/dashboard', requireAuth, requireRoles('admin', 'superadmin'), dashboardMetrics);
reportRouter.get('/sales', requireAuth, requireRoles('seller', 'admin', 'superadmin'), salesSummary);


