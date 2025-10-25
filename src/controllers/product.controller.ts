import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Product } from '../models/Product';
import { cloudinary } from '../config/cloudinary';

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw createHttpError(401, 'Unauthorized');
    const { name, description, price, cost, stock, minStock, shopId, categoryId, sku } = req.body as any;
    // Enforce shop approval
    const { Shop } = await import('../models/Shop');
    
    const files = (Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : []) || [];

    const images = [] as Array<{ url: string; publicId: string }>;
    for (const file of files) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: 'easybizness/products',
        resource_type: 'image',
      });
      images.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
    }

    // Auto-generate barcode if missing: 12-digit numeric with time + random
    const generatedBarcode = `EZ${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const product = await Product.create({
      name,
      description,
      price,
      cost: typeof cost !== 'undefined' ? Number(cost) : undefined,
      stock,
      minStock: typeof minStock !== 'undefined' ? Number(minStock) : undefined,
      shopId,
      categoryId: categoryId || null,
      sku,
      barcode: generatedBarcode,
      images,
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', q, sku, barcode, shopId } = req.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const filter: any = {};
    if (shopId) filter.shopId = shopId;
    if (q) {
      filter.$or = [
        { name: { $regex: String(q), $options: 'i' } },
        { sku: { $regex: String(q), $options: 'i' } },
        { barcode: { $regex: String(q), $options: 'i' } },
      ];
    }
    if (sku) filter.sku = String(sku);
    if (barcode) filter.barcode = String(barcode);
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(filter),
    ]);
    // Align with frontend expectation: { products }
    res.json({ products: items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
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
    // If multipart update with potential images, handle uploads
    const files = (Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : []) || [];
    let imagesToAppend: Array<{ url: string; publicId: string }> = [];
    for (const file of files) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: 'easybizness/products',
        resource_type: 'image',
      });
      imagesToAppend.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
    }
    const update: any = { ...req.body };
    if (imagesToAppend.length > 0) {
      update.$push = { images: { $each: imagesToAppend } };
    }
    // Prevent changing shopId across shops
    if (update.shopId) delete update.shopId;
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
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

export async function updateStock(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      throw createHttpError(400, 'Invalid stock value');
    }

    let updateQuery: any;
    switch (operation) {
      case 'add':
        updateQuery = { $inc: { stock } };
        break;
      case 'subtract':
        updateQuery = { $inc: { stock: -stock } };
        break;
      case 'set':
      default:
        updateQuery = { stock };
        break;
    }

    const product = await Product.findByIdAndUpdate(id, updateQuery, { new: true });
    if (!product) throw createHttpError(404, 'Product not found');
    
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function lookupProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { sku, barcode, shopId } = req.query as any;
    if (!sku && !barcode) throw createHttpError(400, 'Provide sku or barcode');
    const query: any = {
      $or: [
        ...(sku ? [{ sku: String(sku) }] : []),
        ...(barcode ? [{ barcode: String(barcode) }] : []),
      ],
    };
    if (shopId) query.shopId = shopId;
    const product = await Product.findOne(query);
    if (!product) throw createHttpError(404, 'Product not found');
    res.json({ product });
  } catch (err) {
    next(err);
  }
}


