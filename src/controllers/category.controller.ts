
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Category } from '../models/Category';

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug, shopId } = req.body as {
      name: string;
      slug?: string;
      shopId?: string;
    };

    if (!shopId) throw createHttpError(400, 'shopId is required');

    const finalSlug = slug
      ? slug.toLowerCase()
      : name.toLowerCase().replace(/\s+/g, '-');

    // Check for duplicate name/slug within the same shop
    const exists = await Category.findOne({
      shopId,
      $or: [{ name }, { slug: finalSlug }],
    });
    if (exists) throw createHttpError(409, 'Category already exists for this shop');

    const category = await Category.create({
      name,
      slug: finalSlug,
      shopId,
    });

    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { shopId } = req.query as any;
    const filter: any = {};
    if (shopId) filter.shopId = shopId;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) throw createHttpError(404, 'Category not found');
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw createHttpError(404, 'Category not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
