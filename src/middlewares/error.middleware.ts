import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ message: 'Not Found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (createHttpError.isHttpError(err)) {
    return res.status(err.statusCode).json({ message: err.message, errors: (err as any).errors });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
}


