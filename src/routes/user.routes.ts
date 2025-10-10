import { Router } from 'express';
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const userRouter = Router();

userRouter.get('/', requireAuth, requireRoles('admin', 'superadmin'), listUsers);
userRouter.get('/:id', requireAuth, requireRoles('admin', 'superadmin'), getUser);
userRouter.patch('/:id', requireAuth, requireRoles('admin', 'superadmin'), updateUser);
userRouter.delete('/:id', requireAuth, requireRoles('admin', 'superadmin'), deleteUser);


