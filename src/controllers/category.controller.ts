import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Category } from '../models/Category';

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug } = req.body as { name: string; slug: string };
    const exists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (exists) throw createHttpError(409, 'Category exists');
    const category = await Category.create({ name, slug: slug.toLowerCase() });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
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


