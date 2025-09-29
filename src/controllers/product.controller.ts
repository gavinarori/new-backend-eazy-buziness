import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Product } from '../models/Product';
import { cloudinary } from '../config/cloudinary';

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { name, description, price, stock, shopId, categoryId } = req.body as any;
    // Enforce shop approval
    const { Shop } = await import('../models/Shop');
    const shop = await Shop.findById(shopId);
    if (!shop) throw createHttpError(400, 'Invalid shop');
    if (shop.status !== 'approved') throw createHttpError(403, 'Shop not approved');
    const files = (req.files as Express.Multer.File[]) || [];

    const images = [] as Array<{ url: string; publicId: string }>;
    for (const file of files) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: 'easybizness/products',
        resource_type: 'image',
      });
      images.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
    }

    const product = await Product.create({ name, description, price, stock, shopId, categoryId, images });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', q } = req.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const filter: any = {};
    if (q) filter.name = { $regex: String(q), $options: 'i' };
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw createHttpError(404, 'Product not found');
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) throw createHttpError(404, 'Product not found');
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw createHttpError(404, 'Product not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


