import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(createHttpError(401, 'Authentication required'));

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as any;
    req.user = { id: payload.sub as string, role: payload.role, shopId: payload.shopId ?? null };
    return next();
  } catch {
    return next(createHttpError(401, 'Invalid or expired token'));
  }
}

export function requireRoles(...roles: Array<'customer' | 'seller' | 'admin' | 'superadmin'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(createHttpError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) return next(createHttpError(403, 'Forbidden'));
    return next();
  };
}
