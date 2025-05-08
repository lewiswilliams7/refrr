import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { campaignController } from '../controllers/campaign.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Debug logging middleware
const loggerMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  console.log(`[Campaign Routes] ${req.method} ${req.url}`);
  next();
};

router.use(loggerMiddleware);

// Public routes
router.get('/public', asyncHandler(campaignController.getPublicCampaigns));

// Protected routes
router.use(authenticateToken);

// Create new campaign
router.post('/', asyncHandler(campaignController.createCampaign));

// Get all campaigns for a business
router.get('/', asyncHandler(campaignController.getBusinessCampaigns));

// Get campaign by ID
router.get('/:id', asyncHandler(campaignController.getCampaignById));

// Update campaign
router.put('/:id', asyncHandler(campaignController.updateCampaign));

// Delete campaign
router.delete('/:id', asyncHandler(campaignController.deleteCampaign));

// 404 handler for campaign routes
const notFoundHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  console.log(`[Campaign Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Campaign route not found' });
};

router.use(notFoundHandler);

export default router;
