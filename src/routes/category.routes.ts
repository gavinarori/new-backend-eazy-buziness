import { Router } from 'express';
import { createCategory, listCategories, updateCategory, deleteCategory } from '../controllers/category.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const categoryRouter = Router();

categoryRouter.get('/', listCategories);
categoryRouter.post('/', requireAuth, requireRoles('admin', 'superadmin'), createCategory);
categoryRouter.patch('/:id', requireAuth, requireRoles('admin', 'superadmin'), updateCategory);
categoryRouter.delete('/:id', requireAuth, requireRoles('admin', 'superadmin'), deleteCategory);


