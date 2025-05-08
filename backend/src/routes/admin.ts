import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.use(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await authenticateToken(req, res, next);
});

// Campaign routes
router.get('/campaigns', adminController.getCampaigns);
router.get('/campaigns/:id', async (req: AuthRequest, res: Response) => {
  await adminController.getCampaign(req, res);
});

router.patch('/campaigns/:id/status', async (req: AuthRequest, res: Response) => {
  await adminController.updateCampaignStatus(req, res);
});

// Business routes
router.get('/businesses', adminController.getBusinesses);
router.get('/businesses/:id', async (req: AuthRequest, res: Response) => {
  await adminController.getBusiness(req, res);
});

router.patch('/businesses/:id/status', async (req: AuthRequest, res: Response) => {
  await adminController.updateBusinessStatus(req, res);
});

// User routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  await adminController.getUser(req, res);
});

router.patch('/users/:id/status', async (req: AuthRequest, res: Response) => {
  await adminController.updateUserStatus(req, res);
});

export default router; 