import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
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

// Public routes (no authentication required)
router.post('/business/register', asyncHandler(authController.registerBusiness));
router.post('/customer/register', asyncHandler(authController.registerCustomer));
router.post('/business/login', asyncHandler(authController.login));
router.post('/customer/login', asyncHandler(authController.login));
router.post('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/resend-verification', asyncHandler(authController.resendVerificationEmail));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/delete-user', asyncHandler(authController.deleteUserByEmail));

// Protected routes (authentication required)
router.use('/me', authenticate);
router.get('/me', asyncHandler(authController.getCurrentUser));

// 404 handler for undefined routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Auth route not found' });
};

router.use(notFoundHandler);

export default router;