import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: 'customer' | 'seller' | 'admin' | 'superadmin';
      shopId?: string | null;
    };
  }
}


