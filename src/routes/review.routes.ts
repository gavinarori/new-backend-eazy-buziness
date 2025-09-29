import { Router } from 'express';
import { addReview, listReviews } from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const reviewRouter = Router();

reviewRouter.get('/', listReviews);
reviewRouter.post('/', requireAuth, addReview);


