import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { referralController } from '../controllers/referral.controller';
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
router.get('/track/:code', asyncHandler(referralController.trackReferral));

// Protected routes
router.post('/', authenticate, asyncHandler(referralController.createReferral));
router.get('/business', authenticate, asyncHandler(referralController.getBusinessReferrals));
router.put('/:id', authenticate, asyncHandler(referralController.updateReferralStatus));
router.delete('/:id', authenticate, asyncHandler(referralController.deleteReferral));

// 404 handler for undefined routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Referral route not found' });
};

router.use(notFoundHandler);

export default router;
