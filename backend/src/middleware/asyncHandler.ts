import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type AsyncRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
}; 