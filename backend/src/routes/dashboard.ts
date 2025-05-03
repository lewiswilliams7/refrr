import express, { Router, RequestHandler } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as RequestHandler);

// Dashboard routes
router.get('/business/:businessId', dashboardController.getBusinessAnalytics as RequestHandler);
router.get('/campaign/:campaignId', dashboardController.getCampaignAnalytics as RequestHandler);
router.get('/overview', dashboardController.getUserOverview as RequestHandler);

export default router;
