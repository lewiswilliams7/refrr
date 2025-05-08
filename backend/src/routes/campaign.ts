import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { campaignController } from '../controllers/campaign.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, asyncHandler(campaignController.createCampaign));
router.get('/', authenticateToken, asyncHandler(campaignController.getCampaigns));
router.get('/:id', authenticateToken, asyncHandler(campaignController.getCampaignById));
router.put('/:id', authenticateToken, asyncHandler(campaignController.updateCampaign));
router.delete('/:id', authenticateToken, asyncHandler(campaignController.deleteCampaign));

// Public routes
router.get('/public/:id', asyncHandler(campaignController.getPublicCampaign));
router.get('/public', asyncHandler(campaignController.getPublicCampaigns));

export default router;
