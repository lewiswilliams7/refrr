import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { customerController } from '../controllers/customer.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Protected routes
router.use(authenticate);

// Customer profile routes
router.get('/profile', asyncHandler(customerController.getProfile));
router.put('/profile', asyncHandler(customerController.updateProfile));

// Customer analytics
router.get('/analytics', asyncHandler(customerController.getAnalytics));

export default router; 