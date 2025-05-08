import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Debug logging middleware
const loggerMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  console.log(`[Admin Routes] ${req.method} ${req.url}`);
  next();
};

router.use(loggerMiddleware);

// Protected routes
router.use(authenticate);
router.use(isAdmin);

// Get all users
router.get('/users', asyncHandler(adminController.getAllUsers));

// Get user by ID
router.get('/users/:id', asyncHandler(adminController.getUser));

// Delete user
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

// Get all businesses
router.get('/businesses', asyncHandler(adminController.getAllBusinesses));

// Get business by ID
router.get('/businesses/:id', asyncHandler(adminController.getBusiness));

// Update business status
router.patch('/businesses/:id/status', asyncHandler(adminController.updateBusinessStatus));

// Delete business
router.delete('/businesses/:id', asyncHandler(adminController.deleteBusiness));

// Get all campaigns
router.get('/campaigns', asyncHandler(adminController.getCampaigns));

// Get campaign by ID
router.get('/campaigns/:id', asyncHandler(adminController.getCampaign));

// Update campaign status
router.put('/campaigns/:id/status', asyncHandler(adminController.updateCampaignStatus));

// Get all referrals
router.get('/referrals', asyncHandler(adminController.getReferrals));

// Get referral by ID
router.get('/referrals/:id', asyncHandler(adminController.getReferral));

// Get dashboard stats
router.get('/dashboard/stats', asyncHandler(adminController.getDashboardStats));

// 404 handler for admin routes
const notFoundHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  console.log(`[Admin Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Admin route not found' });
};

router.use(notFoundHandler);

export default router; 