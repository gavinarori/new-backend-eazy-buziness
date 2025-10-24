import { Router } from 'express';
import { dashboardMetrics, salesSummary, productAnalysis, staffPerformance } from '../controllers/report.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const reportRouter = Router();

reportRouter.get('/dashboard', requireAuth, dashboardMetrics);
reportRouter.get('/sales', requireAuth, salesSummary);
reportRouter.get('/products', requireAuth, productAnalysis);
reportRouter.get('/staff', requireAuth, staffPerformance);


