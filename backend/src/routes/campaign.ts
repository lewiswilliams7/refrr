import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { campaignController } from '../controllers/campaign.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Debug logging middleware
const loggerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`[Campaign Routes] ${req.method} ${req.url}`);
  console.log('[Campaign Routes] Headers:', req.headers);
  console.log('[Campaign Routes] Body:', req.body);
  next();
};

router.use(loggerMiddleware);

// Public routes
router.get('/public', asyncHandler(campaignController.getPublicCampaigns));
router.get('/public/:id', asyncHandler(campaignController.getPublicCampaign));

// Protected routes
router.use(authenticate);

// Get all campaigns for a business (must come before /:id route)
router.get('/business', asyncHandler(async (req: Request, res: Response) => {
  console.log('[Campaign Routes] GET /business hit');
  await campaignController.getBusinessCampaigns(req as any, res);
}));

// Create new campaign
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('[Campaign Routes] POST / hit');
  await campaignController.createCampaign(req as any, res);
}));

// Toggle campaign active status (must come before /:id route)
router.put('/:id/toggle', asyncHandler(campaignController.toggleActive));

// Get campaign by ID
router.get('/:id', asyncHandler(campaignController.getCampaignById));

// Update campaign
router.put('/:id', asyncHandler(campaignController.updateCampaign));

// Delete campaign
router.delete('/:id', asyncHandler(campaignController.deleteCampaign));

// Get campaign analytics
router.get('/analytics', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get analytics for the user's referrals
    const analytics = {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingReferrals: 0,
      totalRewards: 0
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
}));

// 404 handler for campaign routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log(`[Campaign Routes] 404: ${req.method} ${req.url}`);
  console.log('[Campaign Routes] Headers:', req.headers);
  console.log('[Campaign Routes] Body:', req.body);
  res.status(404).json({ message: 'Campaign route not found' });
};

router.use(notFoundHandler);

export default router;
