import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type AsyncRequestHandler = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler) => (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 