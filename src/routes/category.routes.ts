import { Router } from 'express';
import { createCategory, listCategories, updateCategory, deleteCategory } from '../controllers/category.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const categoryRouter = Router();

categoryRouter.get('/', listCategories);
categoryRouter.post('/', requireAuth,  createCategory);
categoryRouter.patch('/:id', requireAuth,  updateCategory);
categoryRouter.delete('/:id', requireAuth,  deleteCategory);


