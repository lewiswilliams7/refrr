import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../middleware/auth';

type AsyncRequestHandler = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as Request | AuthRequest, res, next)).catch(next);
  };
}; 