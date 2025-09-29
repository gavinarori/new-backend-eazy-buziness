import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Review } from '../models/Review';
import { Product } from '../models/Product';

export async function addReview(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { productId, rating, comment } = req.body as any;
    const review = await Review.create({ userId: req.user.id, productId, rating, comment });
    // Update product aggregates
    const stats = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: '$productId', ratingAverage: { $avg: '$rating' }, ratingCount: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: stats[0]?.ratingAverage || 0,
      ratingCount: stats[0]?.ratingCount || 0,
    });
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function listReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.query as any;
    const filter: any = {};
    if (productId) filter.productId = productId;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}


