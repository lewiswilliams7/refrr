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
router.options('/customer/login', (req: Request, res: Response) => {
  console.log('Handling OPTIONS request for customer login');
  res.header('Access-Control-Allow-Origin', 'https://refrr-frontend.onrender.com');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});
router.options('/business/login', (req: Request, res: Response) => {
  console.log('Handling OPTIONS request for business login');
  res.header('Access-Control-Allow-Origin', 'https://refrr-frontend.onrender.com');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});
router.post('/business/register', asyncHandler(authController.registerBusiness));
router.post('/customer/register', asyncHandler(authController.registerCustomer));
router.post('/business/login', asyncHandler(authController.login));
router.post('/customer/login', asyncHandler(authController.login));
router.post('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/resend-verification', asyncHandler(authController.resendVerificationEmail));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

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