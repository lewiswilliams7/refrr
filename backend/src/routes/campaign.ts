import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { campaignController } from '../controllers/campaign.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Debug logging middleware
const loggerMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  console.log(`[Campaign Routes] ${req.method} ${req.url}`);
  next();
};

router.use(loggerMiddleware);

// Public routes
router.get('/public', asyncHandler(campaignController.getPublicCampaigns));
router.get('/public/:id', asyncHandler(campaignController.getPublicCampaign));

// Protected routes
router.use(authenticate);

// Create new campaign
router.post('/', asyncHandler(campaignController.createCampaign));

// Get all campaigns for a business
router.get('/business', asyncHandler(campaignController.getBusinessCampaigns));

// Get campaign by ID
router.get('/:id', asyncHandler(campaignController.getCampaignById));

// Update campaign
router.put('/:id', asyncHandler(campaignController.updateCampaign));

// Delete campaign
router.delete('/:id', asyncHandler(campaignController.deleteCampaign));

// Toggle campaign active status
router.put('/:id/toggle', asyncHandler(campaignController.toggleActive));

// 404 handler for campaign routes
const notFoundHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  console.log(`[Campaign Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Campaign route not found' });
};

router.use(notFoundHandler);

export default router;
