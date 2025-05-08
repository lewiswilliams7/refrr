import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { dashboardController } from '../controllers/dashboard.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Debug logging middleware
const loggerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`[Dashboard Routes] ${req.method} ${req.url}`);
  next();
};

router.use(loggerMiddleware);

// Protected routes
router.use(authenticate);

// Get dashboard statistics
router.get('/stats', asyncHandler(dashboardController.getStats));

// Get business dashboard
router.get('/business', asyncHandler(dashboardController.getBusinessDashboard));

// Get business profile
router.get('/profile', asyncHandler(dashboardController.getBusinessProfile));

// 404 handler for dashboard routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(`[Dashboard Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Dashboard route not found' });
};

router.use(notFoundHandler);

export default router;