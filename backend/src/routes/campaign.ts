import express from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticateToken } from '../middleware/auth';
import { RequestHandler } from 'express';

const router = express.Router();

// Protected routes (require authentication)
router.use(authenticateToken as RequestHandler);

// Campaign routes
router.post('/', campaignController.createCampaign as RequestHandler);
router.get('/', campaignController.getCampaigns as RequestHandler);
router.get('/:id', campaignController.getCampaignById as RequestHandler);
router.patch('/:id', campaignController.updateCampaign as RequestHandler);
router.delete('/:id', campaignController.deleteCampaign as RequestHandler);

// Public routes (no authentication required)
router.get('/public', campaignController.getPublicCampaigns as RequestHandler);
router.get('/public/:id', campaignController.getPublicCampaign as RequestHandler);

export default router;
