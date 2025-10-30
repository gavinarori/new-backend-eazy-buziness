import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import createHttpError from 'http-errors';

import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  // Security & common middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
      ],
      // ❌ No need for credentials when using Authorization headers
      credentials: false,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // API routes
  app.use('/api', apiRouter);

  // 404 and error handlers
  app.use((_req, _res, next) => next(createHttpError(404, 'Route not found')));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
