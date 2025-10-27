import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct, lookupProduct, updateStock } from '../controllers/product.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

// Use disk storage temp dir; Cloudinary upload in controller
const upload = multer({ dest: path.join(os.tmpdir(), 'easybizness-uploads') });

export const productRouter = Router();

productRouter.get('/', listProducts);
productRouter.get('/lookup', lookupProduct);
productRouter.get('/:id', getProduct);
// Accept both `image` and `images` form fields
productRouter.post('/', upload.any(), createProduct);
// Allow multipart updates as well
productRouter.patch('/:id', requireAuth, upload.any(), updateProduct);
// Stock update endpoint
productRouter.patch('/:id/stock', requireAuth, updateStock);
productRouter.delete('/:id', requireAuth,  deleteProduct);


