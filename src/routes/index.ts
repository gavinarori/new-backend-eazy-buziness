import { Router } from 'express';
import { authRouter } from './auth.routes';
import { shopRouter } from './shop.routes';
import { productRouter } from './product.routes';
import { categoryRouter } from './category.routes';
import { orderRouter } from './order.routes';
import { reviewRouter } from './review.routes';
import { supplyRouter } from './supply.routes';
import { settingsRouter } from './settings.routes';
import { notificationRouter } from './notification.routes';
import { invoiceRouter } from './invoice.routes';
import { saleRouter } from './sale.routes';
import { reportRouter } from './report.routes';
import { userRouter } from './user.routes';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => res.json({ message: 'Easybizness API' }));

// Mount feature routers here as they are implemented
apiRouter.use('/auth', authRouter);
apiRouter.use('/shops', shopRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/supplies', supplyRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/invoices', invoiceRouter);
apiRouter.use('/sales', saleRouter);
apiRouter.use('/reports', reportRouter);


