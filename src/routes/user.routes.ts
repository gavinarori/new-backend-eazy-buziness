import { Router } from 'express';
import { listUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/user.controller';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware';

export const userRouter = Router();

userRouter.get('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), listUsers);
userRouter.post('/', requireAuth, requireRoles('seller', 'admin', 'superadmin'), createUser);
userRouter.get('/:id', requireAuth, requireRoles('seller', 'admin', 'superadmin'), getUser);
userRouter.patch('/:id', requireAuth, requireRoles('seller', 'admin', 'superadmin'), updateUser);
userRouter.delete('/:id', requireAuth, requireRoles('seller', 'admin', 'superadmin'), deleteUser);


