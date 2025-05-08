import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/async';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Logger middleware
const loggerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`${req.method} ${req.url}`);
  next();
};

// Apply logger middleware to all routes
router.use(loggerMiddleware);

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.post('/logout', authenticate, asyncHandler(authController.logout));

// 404 handler for undefined routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Auth route not found' });
};

router.use(notFoundHandler);

export default router;