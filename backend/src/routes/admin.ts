import express, { RequestHandler } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';

const router = express.Router();

// Apply authentication and admin check to all admin routes
router.use((req, res, next) => {
  authenticateToken(req, res, () => {
    isAdmin(req, res, next);
  });
});

// Admin routes
router.get('/campaigns', adminController.getCampaigns as RequestHandler);
router.get('/campaigns/:id', adminController.getCampaign as RequestHandler);
router.patch('/campaigns/:id/status', adminController.updateCampaignStatus as RequestHandler);

router.get('/businesses', adminController.getBusinesses as RequestHandler);
router.get('/businesses/:id', adminController.getBusiness as RequestHandler);
router.patch('/businesses/:id/status', adminController.updateBusinessStatus as RequestHandler);

router.get('/users', adminController.getUsers as RequestHandler);
router.get('/users/:id', adminController.getUser as RequestHandler);
router.patch('/users/:id/status', adminController.updateUserStatus as RequestHandler);

export default router; 