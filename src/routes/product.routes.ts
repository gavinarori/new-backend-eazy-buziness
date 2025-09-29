import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

// Use disk storage temp dir; Cloudinary upload in controller
const upload = multer({ dest: path.join(os.tmpdir(), 'easybizness-uploads') });

export const productRouter = Router();

productRouter.get('/', listProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), upload.array('images', 6), createProduct);
productRouter.patch('/:id', requireAuth, requireRoles('seller', 'admin', 'superadmin'), updateProduct);
productRouter.delete('/:id', requireAuth, requireRoles('admin', 'superadmin'), deleteProduct);


