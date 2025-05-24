import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Campaign } from '../models/campaign.model';
import { User } from '../models/user.model';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all campaigns for a business
router.get('/business', authenticate, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const campaigns = await Campaign.find({ businessId: req.user.userId });
  res.json(campaigns);
}));

// Get public campaigns
router.get('/public', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const campaigns = await Campaign.find({ status: 'active' });
  res.json(campaigns);
}));

// Get public campaign by ID
router.get('/public/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const campaign = await Campaign.findOne({ _id: req.params.id, status: 'active' });
  if (!campaign) {
    res.status(404).json({ message: 'Campaign not found' });
    return;
  }
  res.json(campaign);
}));

// Create new campaign
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const campaign = new Campaign({
    ...req.body,
    businessId: req.user.userId
  });

  await campaign.save();
  res.status(201).json(campaign);
}));

// Update campaign
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const campaign = await Campaign.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.userId },
    req.body,
    { new: true }
  );

  if (!campaign) {
    res.status(404).json({ message: 'Campaign not found' });
    return;
  }

  res.json(campaign);
}));

// Delete campaign
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, businessId: req.user.userId });
  if (!campaign) {
    res.status(404).json({ message: 'Campaign not found' });
    return;
  }

  res.json({ message: 'Campaign deleted successfully' });
}));

// Toggle campaign status
router.put('/:id/toggle', authenticate, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const campaign = await Campaign.findOne({ _id: req.params.id, businessId: req.user.userId });
  if (!campaign) {
    res.status(404).json({ message: 'Campaign not found' });
    return;
  }

  campaign.status = campaign.status === 'active' ? 'paused' : 'active';
  await campaign.save();

  res.json(campaign);
}));

export default router; 