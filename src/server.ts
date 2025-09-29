import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createApp } from './app';
import { logger } from './utils/logger';

const MONGO_URI = process.env.MONGO_URI as string;
const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    if (!MONGO_URI) {
      logger.error('Missing MONGO_URI in environment');
      process.exit(1);
    }
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      logger.error('Missing JWT secrets in environment');
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    const app = createApp();
    app.listen(PORT, () => logger.info(`API listening on port ${PORT}`));
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

start();


