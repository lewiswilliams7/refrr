import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Debug logging middleware
const loggerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`[Admin Routes] ${req.method} ${req.url}`);
  next();
};

router.use(loggerMiddleware);

// Protected routes
router.use(authenticate);
router.use(isAdmin);

// Get all users
router.get('/users', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getAllUsers(req, res);
}));

// Get user by ID
router.get('/users/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getUser(req, res);
}));

// Delete user
router.delete('/users/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.deleteUser(req, res);
}));

// Get all businesses
router.get('/businesses', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getAllBusinesses(req, res);
}));

// Get business by ID
router.get('/businesses/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getBusiness(req, res);
}));

// Update business status
router.patch('/businesses/:id/status', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.updateBusinessStatus(req, res);
}));

// Delete business
router.delete('/businesses/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.deleteBusiness(req, res);
}));

// Get all campaigns
router.get('/campaigns', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getCampaigns(req, res);
}));

// Get campaign by ID
router.get('/campaigns/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getCampaign(req, res);
}));

// Update campaign status
router.put('/campaigns/:id/status', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.updateCampaignStatus(req, res);
}));

// Get all referrals
router.get('/referrals', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getReferrals(req, res);
}));

// Get referral by ID
router.get('/referrals/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getReferral(req, res);
}));

// Get dashboard stats
router.get('/dashboard/stats', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await adminController.getDashboardStats(req, res);
}));

// 404 handler for admin routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(`[Admin Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Admin route not found' });
};

router.use(notFoundHandler);

export default router; 