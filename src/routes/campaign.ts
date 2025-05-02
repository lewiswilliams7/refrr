import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/', authenticateToken, campaignController.createCampaign);
router.get('/', authenticateToken, campaignController.getCampaigns);
router.get('/:id', authenticateToken, campaignController.getCampaignById);
router.put('/:id', authenticateToken, campaignController.updateCampaign);
router.delete('/:id', authenticateToken, campaignController.deleteCampaign);

// Public routes
router.get('/public/:id', campaignController.getPublicCampaign);
router.get('/public', campaignController.getPublicCampaigns);

export default router;
